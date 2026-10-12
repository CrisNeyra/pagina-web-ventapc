export function obtenerMercadoPagoPublicKey(): string | null {
  const key = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?.trim();
  return key || null;
}

/** Checkout Pro vía Route Handlers (`/api/payments/mercadopago/*`). */
export function pagosConfigurados(): boolean {
  return Boolean(obtenerMercadoPagoPublicKey());
}
