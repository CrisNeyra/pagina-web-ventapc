export function obtenerStripePublishableKey(): string | null {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  return key || null;
}

/** Stripe Elements + API Nest (`NEXT_PUBLIC_API_URL`). */
export function pagosConfigurados(): boolean {
  return Boolean(
    obtenerStripePublishableKey() && process.env.NEXT_PUBLIC_API_URL?.trim()
  );
}
