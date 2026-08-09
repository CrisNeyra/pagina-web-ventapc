import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import {
  aplicarCors,
  excedeRateLimit,
  responderPreflight,
  validarItemsContraCatalogo,
} from "./lib/seguridad";

admin.initializeApp();

const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");

interface ItemPago {
  id: string;
  precio: number;
  cantidad?: number;
}

function parseBearerToken(req: { headers: { authorization?: string } }): string | null {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

function calculateAmount(items: ItemPago[]): number {
  const subtotal = items.reduce((sum, item) => {
    const precio = Number(item.precio);
    const cantidad = Number(item.cantidad ?? 1);
    return sum + precio * cantidad;
  }, 0);

  return Math.round(subtotal * 100);
}

async function verifyUser(req: { headers: { authorization?: string } }) {
  const token = parseBearerToken(req);
  if (!token) {
    throw new Error("UNAUTHORIZED_MISSING_TOKEN");
  }
  return admin.auth().verifyIdToken(token);
}

async function findOrderByPaymentIntent(paymentIntentId: string) {
  const snapshot = await admin
    .firestore()
    .collection("pedidos")
    .where("paymentIntentId", "==", paymentIntentId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0];
}

export const healthcheck = onRequest({ region: "southamerica-east1" }, (_req, res) => {
  res.status(200).json({ ok: true });
});

export const createStripePaymentIntent = onRequest(
  {
    region: "southamerica-east1",
    cors: false,
    secrets: [STRIPE_SECRET_KEY],
  },
  async (req, res) => {
    aplicarCors(req, res);

    if (req.method === "OPTIONS") {
      responderPreflight(req, res);
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
      return;
    }

    const ip = req.headers["x-forwarded-for"] || req.ip || "unknown";
    if (excedeRateLimit(String(ip))) {
      res.status(429).json({ error: "RATE_LIMITED" });
      return;
    }

    try {
      const decodedToken = await verifyUser(req);
      const {
        items,
        currency = "ars",
        metadata = {},
        metodoPago,
        cuotas,
      } = (req.body ?? {}) as {
        items?: ItemPago[];
        currency?: string;
        metadata?: Record<string, string>;
        metodoPago?: string;
        cuotas?: number;
      };

      const metodoPagoValido = metodoPago === "credito" ? "credito" : "debito";
      const cuotasValidas =
        metodoPagoValido === "credito"
          ? Math.min(12, Math.max(1, Number(cuotas) || 1))
          : 1;

      const validacionCatalogo = validarItemsContraCatalogo(items ?? []);
      if (!validacionCatalogo.ok) {
        res.status(400).json({ error: validacionCatalogo.error });
        return;
      }

      const itemsValidos = items as ItemPago[];
      const amount = calculateAmount(itemsValidos);
      if (amount <= 0) {
        res.status(400).json({ error: "INVALID_AMOUNT" });
        return;
      }

      if (excedeRateLimit(`uid:${decodedToken.uid}`)) {
        res.status(429).json({ error: "RATE_LIMITED" });
        return;
      }

      const stripe = new Stripe(STRIPE_SECRET_KEY.value(), {
        apiVersion: "2025-08-27.basil",
      });

      const intent = await stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: { enabled: true },
        metadata: {
          uid: decodedToken.uid,
          source: "aurapro-web",
          metodoPago: metodoPagoValido,
          cuotas: String(cuotasValidas),
          ...metadata,
        },
      });

      const orderRef = await admin.firestore().collection("pedidos").add({
        uid: decodedToken.uid,
        estado: "pending_payment",
        metodoPago: metodoPagoValido,
        cuotas: cuotasValidas,
        paymentIntentId: intent.id,
        amount,
        currency,
        items: itemsValidos,
        metadata: {
          ...metadata,
          metodoPago: metodoPagoValido,
          cuotas: String(cuotasValidas),
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({
        orderId: orderRef.id,
        paymentIntentId: intent.id,
        clientSecret: intent.client_secret,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "UNAUTHORIZED_MISSING_TOKEN") {
        res.status(401).json({ error: "UNAUTHORIZED" });
        return;
      }
      console.error("Error createStripePaymentIntent:", error);
      res.status(500).json({ error: "INTERNAL_ERROR" });
    }
  }
);

export const stripeWebhook = onRequest(
  {
    region: "southamerica-east1",
    cors: false,
    secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("METHOD_NOT_ALLOWED");
      return;
    }

    const signature = req.headers["stripe-signature"];
    if (!signature) {
      res.status(400).send("MISSING_STRIPE_SIGNATURE");
      return;
    }

    try {
      const stripe = new Stripe(STRIPE_SECRET_KEY.value(), {
        apiVersion: "2025-08-27.basil",
      });

      const event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        STRIPE_WEBHOOK_SECRET.value()
      );

      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
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
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
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

      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Error stripeWebhook:", error);
      res.status(400).send("WEBHOOK_ERROR");
    }
  }
);
