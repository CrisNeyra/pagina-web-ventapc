#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import process from "node:process";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

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
  node scripts/firebase/import-users.mjs \\
    --input ./exports/auth-users.json \\
    --service-account ./secrets/firebase-service-account.json

Opcional:
  --dry-run true     # valida mapeo sin importar

Notas:
  - El script espera hashes bcrypt de Supabase en encrypted_password.
  - Si exportaste con otros nombres, adapta normalizarUsuario().
`);
}

function normalizarUsuario(raw, index) {
  const uid = String(raw.id ?? raw.uid ?? "").trim();
  const email = String(raw.email ?? "").trim().toLowerCase();
  const hash = String(
    raw.encrypted_password ?? raw.password_hash ?? raw.passwordHash ?? ""
  ).trim();
  const emailVerified = Boolean(raw.email_confirmed_at || raw.email_verified);

  if (!uid) {
    throw new Error(`Fila ${index}: falta id/uid`);
  }
  if (!email) {
    throw new Error(`Fila ${index}: falta email`);
  }
  if (!hash) {
    throw new Error(
      `Fila ${index}: falta encrypted_password/password_hash para importacion masiva`
    );
  }

  return {
    uid,
    email,
    emailVerified,
    passwordHash: Buffer.from(hash),
  };
}

async function readUsers(inputPath) {
  const raw = await readFile(inputPath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("El archivo de entrada debe ser un array JSON de usuarios.");
  }
  return parsed;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help === "true" || !args.input || !args["service-account"]) {
    usage();
    process.exit(args.help === "true" ? 0 : 1);
  }

  const usersRaw = await readUsers(args.input);
  const users = usersRaw.map((row, i) => normalizarUsuario(row, i + 1));

  console.log(`Usuarios leidos: ${users.length}`);

  if (args["dry-run"] === "true") {
    console.log("Dry run finalizado. No se importaron usuarios.");
    return;
  }

  const serviceAccountRaw = await readFile(args["service-account"], "utf8");
  const serviceAccount = JSON.parse(serviceAccountRaw);

  initializeApp({
    credential: cert(serviceAccount),
  });

  const result = await getAuth().importUsers(users, {
    hash: {
      algorithm: "BCRYPT",
    },
  });

  console.log(`Importados: ${result.successCount}`);
  console.log(`Fallidos: ${result.failureCount}`);

  if (result.failureCount > 0) {
    result.errors.forEach((errorInfo) => {
      console.error(
        `- index ${errorInfo.index}: ${errorInfo.error.code} - ${errorInfo.error.message}`
      );
    });
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Error al importar usuarios:", error);
  process.exit(1);
});
