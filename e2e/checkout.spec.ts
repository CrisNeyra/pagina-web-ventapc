import { test, expect } from "@playwright/test";

async function cerrarBannerSiExiste(page: import("@playwright/test").Page) {
  await page.keyboard.press("Escape").catch(() => undefined);
  const cerrarBanner = page.getByLabel("Cerrar banner de cuotas");
  if (await cerrarBanner.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await cerrarBanner.click({ force: true }).catch(() => undefined);
  }
}

async function esperarCheckoutPideLogin(page: import("@playwright/test").Page) {
  await expect(
    page.getByText(/iniciá sesión|iniciar sesión/i).first()
  ).toBeVisible({ timeout: 15_000 });
}

test.describe("Flujo de compra", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await cerrarBannerSiExiste(page);
  });

  test("agrega producto al carrito y llega al checkout", async ({ page }) => {
    await page.goto("/productos");
    await cerrarBannerSiExiste(page);

    const botonesAgregar = page.getByRole("button", { name: /agregar al carrito/i });
    await expect(botonesAgregar.first()).toBeVisible({ timeout: 15_000 });
    await botonesAgregar.first().click();

    await expect(page.getByRole("heading", { name: /iniciar sesión/i })).toBeVisible();
    await expect(page.getByLabel("Abrir carrito")).toBeVisible();
    await expect(page.getByLabel(/abrir carrito, \d+ productos/i)).toHaveCount(0);

    await page.goto("/checkout");
    await esperarCheckoutPideLogin(page);
  });

  test("muestra login requerido en checkout sin sesión", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "venta-pc-cart",
        JSON.stringify({
          state: {
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
          },
          version: 0,
        })
      );
    });

    await page.goto("/checkout");
    await esperarCheckoutPideLogin(page);
  });

  test("página de éxito muestra confirmación", async ({ page }) => {
    await page.goto("/checkout/exito?orderId=test-order&metodo=efectivo");
    await expect(page.getByRole("heading", { name: /pedido confirmado/i })).toBeVisible();
    await expect(page.getByText(/test-order/)).toBeVisible();
  });

  test("éxito pendiente de Mercado Pago", async ({ page }) => {
    await page.goto("/checkout/exito?orderId=mp-pending&pending=1");
    await expect(page.getByRole("heading", { name: /pago en proceso/i })).toBeVisible();
    await expect(page.getByText(/mp-pending/)).toBeVisible();
  });

  test("error de pago muestra pedido y reintento", async ({ page }) => {
    await page.goto("/checkout/error?orderId=mp-fail");
    await expect(page.getByRole("heading", { name: /no se pudo completar el pago/i })).toBeVisible();
    await expect(page.getByRole("main").getByText(/pedido:\s*mp-fail/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /reintentar checkout/i })).toBeVisible();
  });
});
