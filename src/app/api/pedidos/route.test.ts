import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const verifyIdToken = vi.fn();
const docSet = vi.fn();
const archivoSave = vi.fn();

vi.mock("@/lib/firebase-admin", () => ({
  firebaseAdminConfigurado: vi.fn(() => true),
  obtenerFirebaseAuthAdmin: vi.fn(() => ({
    verifyIdToken,
  })),
  obtenerFirestoreAdmin: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({ set: docSet })),
    })),
  })),
  obtenerStorageAdmin: vi.fn(() => ({
    bucket: vi.fn(() => ({
      file: vi.fn(() => ({ save: archivoSave })),
    })),
  })),
}));

vi.mock("@/datos/preciosCatalogo", () => ({
  preciosCatalogo: {
    "gpu-001": 100000,
  },
}));

import { POST as crearPedido } from "./route";

describe("POST /api/pedidos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyIdToken.mockResolvedValue({ uid: "user-123" });
    docSet.mockResolvedValue(undefined);
  });

  it("rechaza solicitudes sin token", async () => {
    const request = new NextRequest("http://localhost/api/pedidos", {
      method: "POST",
      body: JSON.stringify({ metodoPago: "efectivo", items: [] }),
    });

    const response = await crearPedido(request);
    expect(response.status).toBe(401);
  });

  it("crea pedido offline con transferencia y descuento", async () => {
    const request = new NextRequest("http://localhost/api/pedidos", {
      method: "POST",
      headers: { authorization: "Bearer token-valido" },
      body: JSON.stringify({
        metodoPago: "transferencia",
        entrega: { tipo: "retiro" },
        items: [{ id: "gpu-001", precio: 100000, cantidad: 1 }],
      }),
    });

    const response = await crearPedido(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.total).toBe(90000);
    expect(docSet).toHaveBeenCalledOnce();
  });

  it("suma costo de envío al total", async () => {
    const request = new NextRequest("http://localhost/api/pedidos", {
      method: "POST",
      headers: { authorization: "Bearer token-valido" },
      body: JSON.stringify({
        metodoPago: "efectivo",
        entrega: {
          tipo: "envio",
          envio: {
            direccion: "Calle 123",
            ciudad: "CABA",
            codigoPostal: "1425",
            telefonoContacto: "+54 11 5555-5555",
          },
        },
        items: [{ id: "gpu-001", precio: 100000, cantidad: 1 }],
      }),
    });

    const response = await crearPedido(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.total).toBe(105000);
  });

  it("rechaza método de pago inválido", async () => {
    const request = new NextRequest("http://localhost/api/pedidos", {
      method: "POST",
      headers: { authorization: "Bearer token-valido" },
      body: JSON.stringify({
        metodoPago: "credito",
        items: [{ id: "gpu-001", precio: 100000, cantidad: 1 }],
      }),
    });

    const response = await crearPedido(request);
    expect(response.status).toBe(400);
  });
});
