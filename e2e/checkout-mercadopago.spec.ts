import { test, expect } from "@playwright/test";

const password = "Aura2026x";

test.describe("Checkout Mercado Pago", () => {
  test("usuario logueado ve Checkout Pro y redirige con preferencia mock", async ({
    page,
  }) => {
    const email = `e2e_mp_${Date.now()}@aurapro.test`;

    const registro = await page.request.post("/api/auth/register", {
      data: { email, password },
    });
    if (![200, 201].includes(registro.status())) {
      test.skip(true, "No se pudo registrar usuario de prueba (¿DATABASE_URL?)");
    }

    const login = await page.request.post("/api/auth/login", {
      data: { email, password },
    });
    if (!login.ok()) {
      test.skip(true, "No se pudo iniciar sesión de prueba");
    }

    const cuerpo = (await registro.json()) as { user?: { id: string } };
    const userId = cuerpo.user?.id;
    if (!userId) {
      test.skip(true, "El registro no devolvió el id de usuario");
    }

    await page.addInitScript((id) => {
      localStorage.setItem(
        `venta-pc-cart:${id}`,
        JSON.stringify({
          items: [
            {
              producto: {
                id: "gpu-001",
                nombre: "RTX 4070 Test",
                precio: 100000,
                imagen: "/placeholder-producto.svg",
                enStock: true,
              },
              cantidad: 1,
            },
          ],
          totalItems: 1,
          subtotal: 100000,
        })
      );
    }, userId);

    await page.route("**/api/payments/mercadopago/preference", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          orderId: "order-e2e-mp",
          preferenceId: "pref-e2e",
          checkoutUrl:
            "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref-e2e",
          totalPesos: 100000,
        }),
      });
    });

    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: /checkout/i })).toBeVisible({
      timeout: 15_000,
    });

    const config = await page.request.get("/api/payments/mercadopago/config");
    const { enabled } = (await config.json()) as { enabled?: boolean };
    if (!enabled) {
      test.skip(true, "MERCADOPAGO_ACCESS_TOKEN no está en el servidor");
    }

    const credito = page.getByRole("button", { name: /tarjeta de crédito/i });
    await expect(credito).toBeVisible({ timeout: 15_000 });
    await credito.click();
    await expect(page.getByRole("button", { name: /pagar con mercado pago/i })).toBeVisible();

    await page.getByRole("button", { name: /pagar con mercado pago/i }).click();
    await page.waitForURL(/mercadopago\.com/, { timeout: 15_000 });
  });
});
