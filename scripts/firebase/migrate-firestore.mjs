#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import process from "node:process";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    if (!current.startsWith("--")) continue;
    const key = current.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = "true";
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function usage() {
  console.log(`
Uso:
  node scripts/firebase/migrate-firestore.mjs \\
    --input ./exports/pc_builds.json \\
    --collection pc_builds \\
    --service-account ./secrets/firebase-service-account.json

Opcional:
  --id-field id        # por defecto: id
  --dry-run true       # valida sin escribir

Notas:
  - El archivo de entrada debe ser un array JSON.
  - Se ignora created_at de origen y se guarda server timestamp en Firestore.
`);
}

function toDocId(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function normalizarRegistro(raw) {
  return {
    user_id: String(raw.user_id ?? ""),
    subtotal: Number(raw.subtotal ?? 0),
    items: Array.isArray(raw.items) ? raw.items : [],
    created_at: FieldValue.serverTimestamp(),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input || !args.collection || !args["service-account"]) {
    usage();
    process.exit(1);
  }

  const idField = args["id-field"] ?? "id";
  const inputRaw = await readFile(args.input, "utf8");
  const rows = JSON.parse(inputRaw);
  if (!Array.isArray(rows)) {
    throw new Error("La entrada debe ser un array JSON.");
  }

  console.log(`Registros leidos: ${rows.length}`);
  if (args["dry-run"] === "true") {
    console.log("Dry run finalizado. No se escribio en Firestore.");
    return;
  }

  const serviceAccountRaw = await readFile(args["service-account"], "utf8");
  const serviceAccount = JSON.parse(serviceAccountRaw);
  initializeApp({
    credential: cert(serviceAccount),
  });

  const db = getFirestore();
  const batchSize = 450;
  let escritos = 0;

  for (let offset = 0; offset < rows.length; offset += batchSize) {
    const block = rows.slice(offset, offset + batchSize);
    const batch = db.batch();

    block.forEach((row, index) => {
      const id = toDocId(row[idField], `migrated-${offset + index + 1}`);
      const ref = db.collection(args.collection).doc(id);
      batch.set(ref, normalizarRegistro(row), { merge: true });
    });

    await batch.commit();
    escritos += block.length;
    console.log(`Batch confirmado: ${escritos}/${rows.length}`);
  }

  console.log(`Migracion finalizada. Documentos escritos: ${escritos}`);
}

main().catch((error) => {
  console.error("Error en migracion Firestore:", error);
  process.exit(1);
});
