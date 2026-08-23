export function obtenerApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api";
}

export function apiConfigurada(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_URL?.trim());
}

export async function apiFetch<T>(
  path: string,
  opciones: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, headers, ...resto } = opciones;
  const url = `${obtenerApiUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const respuesta = await fetch(url, {
    ...resto,
    headers: {
      ...(headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(resto.body && !(resto.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
    },
  });

  if (!respuesta.ok) {
    const datos = (await respuesta.json().catch(() => ({}))) as { message?: string | string[] };
    const mensaje = Array.isArray(datos.message) ? datos.message[0] : datos.message;
    throw new Error(mensaje ?? `API_ERROR_${respuesta.status}`);
  }

  return respuesta.json() as Promise<T>;
}
