export function obtenerStripePublishableKey(): string | null {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  return key || null;
}

/** Stripe Elements + Route Handlers de Next (`/api/payments/stripe/*`). */
export function pagosConfigurados(): boolean {
  return Boolean(obtenerStripePublishableKey());
}
