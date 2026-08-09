export function obtenerStripePublishableKey(): string | null {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  return key || null;
}

export function obtenerUrlPaymentIntent(): string | null {
  const urlExplicita = process.env.NEXT_PUBLIC_CREATE_PAYMENT_INTENT_URL?.trim();
  if (urlExplicita) return urlExplicita;

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  if (!projectId) return null;

  return `https://southamerica-east1-${projectId}.cloudfunctions.net/createStripePaymentIntent`;
}

export function pagosConfigurados(): boolean {
  return Boolean(obtenerStripePublishableKey() && obtenerUrlPaymentIntent());
}
