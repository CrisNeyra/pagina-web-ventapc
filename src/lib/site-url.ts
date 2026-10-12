export const SITE_URL_DEFAULT = "https://proaurapro.vercel.app";

export function normalizarUrlAbsoluta(url: string): string {
  const trimmed = url.trim().replace(/\/$/, "");
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

export function esUrlPublicaHttps(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    return host !== "localhost" && host !== "127.0.0.1" && !host.endsWith(".local");
  } catch {
    return false;
  }
}

export function urlSitio(): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) {
    return normalizarUrlAbsoluta(site);
  }
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (prod) return normalizarUrlAbsoluta(prod);
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return normalizarUrlAbsoluta(vercel);
  return SITE_URL_DEFAULT;
}

/** Mercado Pago exige HTTPS público en back_urls + auto_return. */
export function urlRetornoMercadoPago(): string {
  const candidatos = [
    process.env.MERCADOPAGO_BACK_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
    SITE_URL_DEFAULT,
  ];

  for (const candidato of candidatos) {
    if (!candidato?.trim()) continue;
    const url = normalizarUrlAbsoluta(candidato);
    if (esUrlPublicaHttps(url)) return url;
  }

  return SITE_URL_DEFAULT;
}
