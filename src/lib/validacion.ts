import { z } from "zod";

export const esquemaLogin = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(72),
  recordarme: z.boolean().optional(),
});

export const esquemaRegistro = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(72),
});

export const esquemaOlvido = z.object({
  email: z.string().trim().email(),
});

export const esquemaReset = z.object({
  token: z.string().min(10),
  password: z.string().min(10).max(72),
});

export const esquemaCambioPassword = z.object({
  actual: z.string().min(1).max(72),
  nueva: z.string().min(10).max(72),
});

export const esquemaEstadoPedido = z.object({
  estado: z.enum([
    "pending_payment",
    "pending_cash",
    "pending_transfer",
    "paid",
    "payment_failed",
    "cancelled",
    "ready_for_pickup",
    "shipped",
  ]),
});

export const esquemaStockAdmin = z.object({
  stock: z.number().int().min(0),
  enStock: z.boolean().optional(),
});

export const esquemaPostulacion = z.object({
  nombre: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  telefono: z.string().trim().min(6).max(40),
  mensaje: z.string().trim().min(1).max(4000),
});

const envio = z.object({
  direccion: z.string().trim().min(1),
  ciudad: z.string().trim().min(1),
  codigoPostal: z.string().trim().min(1),
  telefonoContacto: z.string().trim().min(1),
});

export const esquemaPedido = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        precio: z.number().int().nonnegative(),
        cantidad: z.number().int().positive(),
        nombre: z.string().optional(),
      })
    )
    .min(1),
  metodoPago: z.enum(["efectivo", "transferencia"]),
  entrega: z.discriminatedUnion("tipo", [
    z.object({ tipo: z.literal("retiro") }),
    z.object({ tipo: z.literal("envio"), envio }),
  ]),
});
