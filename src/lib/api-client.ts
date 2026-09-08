export function obtenerApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api";
}

export function apiConfigurada(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_URL?.trim());
}

const TIMEOUT_MS_DEFAULT = 8_000;

export async function apiFetch<T>(
  path: string,
  opciones: RequestInit & { token?: string; timeoutMs?: number } = {}
): Promise<T> {
  const { token, headers, timeoutMs = TIMEOUT_MS_DEFAULT, signal: signalExterno, ...resto } =
    opciones;
  const url = `${obtenerApiUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const controlador = new AbortController();
  const timer = setTimeout(() => controlador.abort(), timeoutMs);
  if (signalExterno) {
    if (signalExterno.aborted) controlador.abort();
    else {
      signalExterno.addEventListener("abort", () => controlador.abort(), { once: true });
    }
  }

  try {
    const respuesta = await fetch(url, {
      ...resto,
      signal: controlador.signal,
      headers: {
        ...(headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(resto.body && !(resto.body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
      },
    });

    if (!respuesta.ok) {
      const datos = (await respuesta.json().catch(() => ({}))) as {
        message?: string | string[];
      };
      const mensaje = Array.isArray(datos.message) ? datos.message[0] : datos.message;
      throw new Error(mensaje ?? `API_ERROR_${respuesta.status}`);
    }

    return respuesta.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("La API no respondió a tiempo. Verificá que Nest esté en marcha.");
    }
    if (error instanceof TypeError) {
      throw new Error(
        "No se pudo conectar con la API. Revisá NEXT_PUBLIC_API_URL y que Nest esté arriba."
      );
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
