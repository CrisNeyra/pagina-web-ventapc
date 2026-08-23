import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

/** Prisma CLI carga .env solo; tsx no. Cargamos DATABASE_URL antes del client. */
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

const prisma = new PrismaClient();

interface SeedProduct {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  enStock: boolean;
  imagenes: string[];
  etiqueta?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const seedPath = resolve(__dirname, "seed-data.json");
  if (!existsSync(seedPath)) {
    throw new Error(
      "Falta api/prisma/seed-data.json. Desde la raíz del proyecto ejecutá: npm run catalogo:export:api"
    );
  }

  const productos = JSON.parse(readFileSync(seedPath, "utf-8")) as SeedProduct[];

  for (const producto of productos) {
    await prisma.product.upsert({
      where: { id: producto.id },
      update: {
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        stock: producto.enStock ? 10 : 0,
        enStock: producto.enStock,
        categoria: producto.categoria,
        imagenes: producto.imagenes,
        etiqueta: producto.etiqueta ?? null,
        slug: slugify(`${producto.nombre}-${producto.id}`),
      },
      create: {
        id: producto.id,
        slug: slugify(`${producto.nombre}-${producto.id}`),
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        stock: producto.enStock ? 10 : 0,
        enStock: producto.enStock,
        categoria: producto.categoria,
        imagenes: producto.imagenes,
        etiqueta: producto.etiqueta ?? null,
      },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@aurapro.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin1234ab";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: UserRole.admin, passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
      role: UserRole.admin,
    },
  });

  await prisma.siteConfig.upsert({
    where: { clave: "transferencia" },
    update: {},
    create: {
      clave: "transferencia",
      valor: {
        banco: "Banco Galicia",
        titular: "Aura Pro S.A.",
        cbu: "0070 1234 0000 5678 9012 3456",
        alias: "AURA.PRO.HARDWARE",
      },
    },
  });

  await prisma.siteConfig.upsert({
    where: { clave: "redes_sociales" },
    update: {},
    create: {
      clave: "redes_sociales",
      valor: [
        { id: "instagram", label: "Instagram", href: "https://www.instagram.com/aurapro.hardware" },
        { id: "youtube", label: "YouTube", href: "https://www.youtube.com/@auraprohardware" },
      ],
    },
  });

  const zonas = [
    { nombre: "CABA", codigosPostales: ["10", "11", "12", "13", "14"], costo: 5000 },
    { nombre: "GBA", codigosPostales: ["17", "18", "19"], costo: 7000 },
    { nombre: "Interior", codigosPostales: ["*"], costo: 12000 },
  ];

  const existingZones = await prisma.shippingZone.count();
  if (existingZones === 0) {
    for (const zona of zonas) {
      await prisma.shippingZone.create({ data: zona });
    }
  }

  console.log(`Seed OK: ${productos.length} productos, admin ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
