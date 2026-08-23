/**
 * Migra emails de Firebase Auth a filas `users` en PostgreSQL sin password.
 * Los usuarios deberán usar "registro" Nest o setear password luego.
 *
 * Uso (desde api/, con FIREBASE_SERVICE_ACCOUNT_JSON y DATABASE_URL):
 *   npx tsx scripts/migrate-firebase-users-to-pg.ts
 *   npx tsx scripts/migrate-firebase-users-to-pg.ts --dry-run
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import * as admin from "firebase-admin";
import { PrismaClient, UserRole } from "@prisma/client";

function cargarEnv() {
  const envPath = resolve(__dirname, "../.env");
  if (!existsSync(envPath)) return;
  for (const linea of readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const trimmed = linea.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

cargarEnv();

const dryRun = process.argv.includes("--dry-run");
const prisma = new PrismaClient();

async function main() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!json) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON requerido en api/.env");
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(json) as admin.ServiceAccount),
    });
  }

  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  let nextPageToken: string | undefined;
  let importados = 0;
  let omitidos = 0;

  do {
    const listado = await admin.auth().listUsers(1000, nextPageToken);

    for (const u of listado.users) {
      const email = u.email?.toLowerCase();
      if (!email) {
        omitidos++;
        continue;
      }

      if (dryRun) {
        console.log(`[dry-run] ${email} uid=${u.uid}`);
        importados++;
        continue;
      }

      const existente = await prisma.user.findFirst({
        where: { OR: [{ email }, { firebaseUid: u.uid }] },
      });

      if (existente) {
        if (!existente.firebaseUid) {
          await prisma.user.update({
            where: { id: existente.id },
            data: { firebaseUid: u.uid },
          });
        }
        omitidos++;
        continue;
      }

      await prisma.user.create({
        data: {
          email,
          firebaseUid: u.uid,
          role: admins.includes(email) ? UserRole.admin : UserRole.user,
          passwordHash: null,
        },
      });
      importados++;
      console.log(`Importado: ${email}`);
    }

    nextPageToken = listado.pageToken;
  } while (nextPageToken);

  console.log(`\nResumen: ${importados} importados/vistos, ${omitidos} omitidos`);
  console.log(
    "Nota: usuarios sin passwordHash deben registrarse de nuevo o resetear password en Nest."
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
