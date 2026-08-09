import catalogoPrecios from "../../catalogoPrecios.json";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 15;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

interface ItemPago {
  id?: string;
  precio?: number;
  cantidad?: number;
}

function obtenerOrigenesPermitidos(): string[] {
  const desdeEnv = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((valor) => valor.trim())
    .filter(Boolean);

  if (desdeEnv.length > 0) return desdeEnv;

  return [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://pagina-web-ventapc.vercel.app",
  ];
}

export function aplicarCors(
  req: { headers: { origin?: string } },
  res: { set: (header: string, value: string) => void }
) {
  const origin = req.headers.origin;
  const permitidos = obtenerOrigenesPermitidos();

  if (origin && permitidos.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
  }

  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export function responderPreflight(
  req: { headers: { origin?: string } },
  res: { set: (header: string, value: string) => void; status: (code: number) => { send: (body: string) => void } }
) {
  aplicarCors(req, res);
  return res.status(204).send("");
}

export function excedeRateLimit(clave: string): boolean {
  const ahora = Date.now();
  const actual = rateLimitStore.get(clave) || {
    count: 0,
    resetAt: ahora + RATE_LIMIT_WINDOW_MS,
  };

  if (ahora > actual.resetAt) {
    actual.count = 0;
    actual.resetAt = ahora + RATE_LIMIT_WINDOW_MS;
  }

  actual.count += 1;
  rateLimitStore.set(clave, actual);
  return actual.count > RATE_LIMIT_MAX;
}

export function validarItemsContraCatalogo(
  items: ItemPago[]
): { ok: true } | { ok: false; error: string } {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "INVALID_ITEMS" };
  }

  const precios = catalogoPrecios as Record<string, number>;

  for (const item of items) {
    const precio = Number(item?.precio ?? 0);
    const cantidad = Number(item?.cantidad ?? 1);
    if (!item?.id || precio <= 0 || cantidad <= 0) {
      return { ok: false, error: "INVALID_ITEMS" };
    }

    const precioCatalogo = precios[item.id];
    if (precioCatalogo === undefined) {
      return { ok: false, error: "UNKNOWN_PRODUCT" };
    }
    if (precio !== precioCatalogo) {
      return { ok: false, error: "PRICE_MISMATCH" };
    }
  }

  return { ok: true };
}
