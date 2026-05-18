/* eslint-disable @typescript-eslint/no-require-imports */
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const Stripe = require("stripe");

admin.initializeApp();

const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");

function parseBearerToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0) return false;
  return items.every((item) => {
    const precio = Number(item?.precio ?? 0);
    const cantidad = Number(item?.cantidad ?? 1);
    return item?.id && precio > 0 && cantidad > 0;
  });
}

function calculateAmount(items) {
  const subtotal = items.reduce((sum, item) => {
    const precio = Number(item.precio);
    const cantidad = Number(item.cantidad ?? 1);
    return sum + precio * cantidad;
  }, 0);

  return Math.round(subtotal * 100);
}

async function verifyUser(req) {
  const token = parseBearerToken(req);
  if (!token) {
    throw new Error("UNAUTHORIZED_MISSING_TOKEN");
  }
  return admin.auth().verifyIdToken(token);
}

async function findOrderByPaymentIntent(paymentIntentId) {
  const snapshot = await admin
    .firestore()
    .collection("pedidos")
    .where("paymentIntentId", "==", paymentIntentId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0];
}

exports.healthcheck = onRequest({ region: "southamerica-east1" }, (req, res) => {
  res.status(200).json({ ok: true });
});

exports.createStripePaymentIntent = onRequest(
  {
    region: "southamerica-east1",
    cors: true,
    secrets: [STRIPE_SECRET_KEY],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
    }

    try {
      const decodedToken = await verifyUser(req);
      const { items, currency = "ars", metadata = {} } = req.body ?? {};

      if (!validateItems(items)) {
        return res.status(400).json({ error: "INVALID_ITEMS" });
      }

      const amount = calculateAmount(items);
      if (amount <= 0) {
        return res.status(400).json({ error: "INVALID_AMOUNT" });
      }

      const stripe = new Stripe(STRIPE_SECRET_KEY.value(), {
        apiVersion: "2025-04-30.basil",
      });

      const intent = await stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: { enabled: true },
        metadata: {
          uid: decodedToken.uid,
          source: "aurapro-web",
          ...metadata,
        },
      });

      const orderRef = await admin.firestore().collection("pedidos").add({
        uid: decodedToken.uid,
        estado: "pending_payment",
        paymentIntentId: intent.id,
        amount,
        currency,
        items,
        metadata,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({
        orderId: orderRef.id,
        paymentIntentId: intent.id,
        clientSecret: intent.client_secret,
      });
    } catch (error) {
      if (error.message === "UNAUTHORIZED_MISSING_TOKEN") {
        return res.status(401).json({ error: "UNAUTHORIZED" });
      }
      console.error("Error createStripePaymentIntent:", error);
      return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
  }
);

exports.stripeWebhook = onRequest(
  {
    region: "southamerica-east1",
    cors: false,
    secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).send("METHOD_NOT_ALLOWED");
    }

    const signature = req.headers["stripe-signature"];
    if (!signature) {
      return res.status(400).send("MISSING_STRIPE_SIGNATURE");
    }

    try {
      const stripe = new Stripe(STRIPE_SECRET_KEY.value(), {
        apiVersion: "2025-04-30.basil",
      });

      const event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        STRIPE_WEBHOOK_SECRET.value()
      );

      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const orderDoc = await findOrderByPaymentIntent(paymentIntent.id);
        if (orderDoc) {
          await orderDoc.ref.set(
            {
              estado: "paid",
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        }
      }

      if (event.type === "payment_intent.payment_failed") {
        const paymentIntent = event.data.object;
        const orderDoc = await findOrderByPaymentIntent(paymentIntent.id);
        if (orderDoc) {
          await orderDoc.ref.set(
            {
              estado: "payment_failed",
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        }
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error("Error stripeWebhook:", error);

      const esErrorDeFirma =
        error?.type === "StripeSignatureVerificationError" ||
        /signature/i.test(String(error?.message ?? ""));

      if (esErrorDeFirma) {
        return res.status(400).send("INVALID_STRIPE_SIGNATURE");
      }

      // Errores transitorios (Firestore, red, etc.): 500 para que Stripe reintente con backoff.
      return res.status(500).send("WEBHOOK_HANDLER_ERROR");
    }
  }
);
