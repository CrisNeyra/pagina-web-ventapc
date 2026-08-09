import { test, expect } from "@playwright/test";

test.describe("Flujo de compra", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    const cerrarBanner = page.getByLabel("Cerrar banner de cuotas");
    if (await cerrarBanner.isVisible().catch(() => false)) {
      await cerrarBanner.click();
    }
  });

  test("agrega producto al carrito y llega al checkout", async ({ page }) => {
    await page.goto("/productos");

    const botonesAgregar = page.getByRole("button", { name: /agregar al carrito/i });
    await expect(botonesAgregar.first()).toBeVisible({ timeout: 15_000 });
    await botonesAgregar.first().click();

    await page.getByLabel("Abrir carrito").click();
    await expect(page.getByText(/RTX|AMD|Intel|MSI|Corsair/i).first()).toBeVisible();

    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.getByRole("heading", { name: /checkout/i })).toBeVisible();
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
    await expect(page.getByText(/iniciá sesión/i)).toBeVisible();
  });

  test("página de éxito muestra confirmación", async ({ page }) => {
    await page.goto("/checkout/exito?orderId=test-order&metodo=efectivo");
    await expect(page.getByRole("heading", { name: /pedido confirmado/i })).toBeVisible();
    await expect(page.getByText(/test-order/)).toBeVisible();
  });
});
