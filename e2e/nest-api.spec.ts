import { test, expect } from "@playwright/test";

/**
 * Flujos Nest vía API (login, pedido offline, guardar build).
 * Requiere NEXT_PUBLIC_API_URL apuntando a Nest en marcha (o se skippea).
 */
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(
  /\/$/,
  ""
);

async function apiDisponible(request: import("@playwright/test").APIRequestContext) {
  try {
    const health = await request.get(`${API_URL}/health`, { timeout: 5_000 });
    if (!health.ok()) return false;
    const body = (await health.json()) as { ok?: boolean };
    return Boolean(body.ok);
  } catch {
    return false;
  }
}

test.describe("API Nest: login + checkout offline + PC build", () => {
  test("login, pedido efectivo y guardar build", async ({ request }) => {
    test.skip(!(await apiDisponible(request)), "API Nest no disponible en " + API_URL);

    const email = `e2e_${Date.now()}@aurapro.test`;
    const password = "1234ab";

    const registro = await request.post(`${API_URL}/auth/register`, {
      data: { email, password },
    });
    expect(registro.status()).toBeLessThan(500);
    // 201 o 409 si ya existe — en este caso es único
    expect([200, 201]).toContain(registro.status());
    const regBody = (await registro.json()) as { token: string };
    expect(regBody.token).toBeTruthy();

    const login = await request.post(`${API_URL}/auth/login`, {
      data: { email, password },
    });
    expect(login.ok()).toBeTruthy();
    const { token } = (await login.json()) as { token: string };
    expect(token).toBeTruthy();

    const me = await request.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(me.ok()).toBeTruthy();

    const productos = await request.get(`${API_URL}/products`);
    expect(productos.ok()).toBeTruthy();
    const listaJson = (await productos.json()) as {
      productos: {
        id: string;
        precio: number;
        nombre: string;
        enStock?: boolean;
        stock?: number;
      }[];
    };
    const lista = listaJson.productos ?? [];
    const producto = lista.find((p) => p.enStock !== false && (p.stock ?? 1) > 0) ?? lista[0];
    expect(producto).toBeTruthy();

    const pedido = await request.post(`${API_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Idempotency-Key": `e2e-${Date.now()}`,
      },
      data: {
        items: [
          {
            id: producto.id,
            precio: producto.precio,
            cantidad: 1,
            nombre: producto.nombre,
          },
        ],
        metodoPago: "efectivo",
        entrega: { tipo: "retiro" },
      },
    });
    expect([200, 201]).toContain(pedido.status());
    const orderBody = (await pedido.json()) as { id: string; estado: string };
    expect(orderBody.id).toBeTruthy();
    expect(orderBody.estado).toMatch(/pending/);

    const build = await request.post(`${API_URL}/pc-builds`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        subtotal: producto.precio,
        items: [{ categoria: "gpu", productId: producto.id, nombre: producto.nombre }],
      },
    });
    expect([200, 201]).toContain(build.status());
    const buildBody = (await build.json()) as { id: string };
    expect(buildBody.id).toBeTruthy();

    const builds = await request.get(`${API_URL}/pc-builds/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(builds.ok()).toBeTruthy();
    const misBuilds = (await builds.json()) as { id: string }[];
    expect(misBuilds.some((b) => b.id === buildBody.id)).toBeTruthy();
  });
});
