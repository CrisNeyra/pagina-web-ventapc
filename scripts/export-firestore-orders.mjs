/**
 * Exporta pedidos de Firestore a JSON para importar en PostgreSQL.
 * Uso: node scripts/export-firestore-orders.mjs > orders-export.json
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
if (!json) {
  console.error("FIREBASE_SERVICE_ACCOUNT_JSON requerido");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert(JSON.parse(json)) });
}

const db = getFirestore();
const snapshot = await db.collection("pedidos").get();

const pedidos = snapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
}));

console.log(JSON.stringify(pedidos, null, 2));
