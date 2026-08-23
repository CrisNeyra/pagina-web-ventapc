/**
 * Importa pedidos exportados desde Firestore a PostgreSQL.
 *
 * Prerrequisitos:
 *   1. Docker con postgres corriendo
 *   2. npx prisma migrate deploy
 *   3. orders-export.json en la raíz del monorepo
 *
 * Uso (desde api/):
 *   npm run orders:import -- ../orders-export.json
 *   npm run orders:import -- ../orders-export.json --dry-run
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ESTADOS_VALIDOS = new Set([
  "pending_payment",
  "pending_cash",
  "pending_transfer",
  "paid",
  "payment_failed",
  "cancelled",
  "ready_for_pickup",
  "shipped",
]);

function mapearEstado(estado) {
  if (!estado) return "pending_payment";
  const normalizado = String(estado).toLowerCase();
  if (ESTADOS_VALIDOS.has(normalizado)) return normalizado;
  return "pending_payment";
}

function parsearFecha(valor) {
  if (!valor) return new Date();
  if (valor._seconds) return new Date(valor._seconds * 1000);
  if (typeof valor.toDate === "function") return valor.toDate();
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? new Date() : fecha;
}

function totalEnPesos(pedido) {
  if (pedido.totalPesos != null) return Math.round(Number(pedido.totalPesos));
  if (pedido.total != null) return Math.round(Number(pedido.total));
  const amount = Number(pedido.amount ?? 0);
  if (pedido.paymentIntentId || pedido.stripePaymentIntentId) {
    return Math.round(amount / 100);
  }
  return Math.round(amount);
}

function mapearPedido(doc) {
  const items = Array.isArray(doc.items) ? doc.items : [];
  return {
    id: doc.id,
    email: doc.email ?? null,
    estado: mapearEstado(doc.estado),
    metodoPago: doc.metodoPago ?? null,
    totalPesos: totalEnPesos(doc),
    costoEnvio: Math.round(Number(doc.costoEnvio ?? 0)),
    stripePaymentIntentId: doc.paymentIntentId ?? doc.stripePaymentIntentId ?? null,
    stripeAmountCents: doc.paymentIntentId ? Number(doc.amount) : null,
    entrega: doc.entrega ?? null,
    cuotas: doc.cuotas ?? null,
    createdAt: parsearFecha(doc.createdAt),
    items: items.map((item) => ({
      productId: item.id,
      nombre: item.nombre ?? `Producto ${item.id}`,
      precioUnitario: Math.round(Number(item.precio ?? 0)),
      cantidad: Math.max(1, Math.round(Number(item.cantidad ?? 1))),
    })),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const archivo = args.find((a) => !a.startsWith("--"));

  if (!archivo) {
    console.error("Uso: npm run orders:import -- <orders-export.json> [--dry-run]");
    process.exit(1);
  }

  const ruta = resolve(process.cwd(), archivo);
  const pedidos = JSON.parse(readFileSync(ruta, "utf-8"));

  if (!Array.isArray(pedidos)) {
    console.error("El archivo debe contener un array JSON de pedidos.");
    process.exit(1);
  }

  console.log(`Pedidos a importar: ${pedidos.length}${dryRun ? " (dry-run)" : ""}`);

  let importados = 0;
  let omitidos = 0;

  for (const doc of pedidos) {
    const pedido = mapearPedido(doc);

    if (dryRun) {
      console.log(
        `[dry-run] ${pedido.id} — ${pedido.estado} — $${pedido.totalPesos} — ${pedido.items.length} items`
      );
      importados++;
      continue;
    }

    const existente = await prisma.order.findUnique({ where: { id: pedido.id } });
    if (existente) {
      console.log(`Omitido (ya existe): ${pedido.id}`);
      omitidos++;
      continue;
    }

    const productIds = [...new Set(pedido.items.map((i) => i.productId))];
    const productosExistentes = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true },
    });
    const idsValidos = new Set(productosExistentes.map((p) => p.id));

    const itemsValidos = pedido.items.filter((item) => idsValidos.has(item.productId));
    if (itemsValidos.length === 0 && pedido.items.length > 0) {
      console.warn(`Omitido ${pedido.id}: ningún product_id existe en PG`);
      omitidos++;
      continue;
    }

    await prisma.order.create({
      data: {
        id: pedido.id,
        email: pedido.email,
        estado: pedido.estado,
        metodoPago: pedido.metodoPago,
        totalPesos: pedido.totalPesos,
        costoEnvio: pedido.costoEnvio,
        stripePaymentIntentId: pedido.stripePaymentIntentId,
        stripeAmountCents: pedido.stripeAmountCents,
        entrega: pedido.entrega,
        cuotas: pedido.cuotas,
        createdAt: pedido.createdAt,
        items: {
          create: itemsValidos.map((item) => ({
            productId: item.productId,
            nombre: item.nombre,
            precioUnitario: item.precioUnitario,
            cantidad: item.cantidad,
          })),
        },
      },
    });

    importados++;
    console.log(`Importado: ${pedido.id}`);
  }

  console.log(`\nResumen: ${importados} importados, ${omitidos} omitidos`);
}

main()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
