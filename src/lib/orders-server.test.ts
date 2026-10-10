import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMany, findUnique } = vi.hoisted(() => ({
  findMany: vi.fn(),
  findUnique: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findMany },
    order: { findUnique },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/shipping-server", () => ({
  cotizarEnvioPorCp: vi.fn(async () => ({ costo: 0, zona: "test" })),
}));

import { crearPedidoOffline, OrderError } from "@/lib/orders-server";

const pedidoBase = {
  userId: "user-1",
  email: "a@b.c",
  metodoPago: "efectivo" as const,
  entrega: { tipo: "retiro" as const },
};

describe("crearPedidoOffline", () => {
  beforeEach(() => {
    findMany.mockReset();
    findUnique.mockReset();
    findUnique.mockResolvedValue(null);
  });

  it("rechaza un precio distinto al de la base", async () => {
    findMany.mockResolvedValue([
      { id: "proc-001", nombre: "CPU", precio: 1000, stock: 4, enStock: true },
    ]);

    await expect(
      crearPedidoOffline({
        ...pedidoBase,
        items: [{ id: "proc-001", precio: 1, cantidad: 1 }],
      })
    ).rejects.toBeInstanceOf(OrderError);
    await expect(
      crearPedidoOffline({
        ...pedidoBase,
        items: [{ id: "proc-001", precio: 1, cantidad: 1 }],
      })
    ).rejects.toThrow("PRICE_MISMATCH");
  });

  it("rechaza stock insuficiente", async () => {
    findMany.mockResolvedValue([
      { id: "gpu-002", nombre: "GPU", precio: 500, stock: 0, enStock: false },
    ]);

    await expect(
      crearPedidoOffline({
        ...pedidoBase,
        items: [{ id: "gpu-002", precio: 500, cantidad: 1 }],
      })
    ).rejects.toThrow("SIN_STOCK");
  });

  it("rechaza un armado AM5 con mother LGA1700", async () => {
    findMany.mockResolvedValue([
      { id: "proc-001", nombre: "CPU", precio: 100, stock: 3, enStock: true },
      { id: "mother-001", nombre: "MB", precio: 200, stock: 3, enStock: true },
    ]);

    await expect(
      crearPedidoOffline({
        ...pedidoBase,
        items: [
          { id: "proc-001", precio: 100, cantidad: 1 },
          { id: "mother-001", precio: 200, cantidad: 1 },
        ],
      })
    ).rejects.toThrow("INCOMPATIBLE_BUILD");
  });
});
