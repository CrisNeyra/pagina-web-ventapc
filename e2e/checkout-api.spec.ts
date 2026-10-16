import { test, expect } from "@playwright/test";

test.describe("Checkout con API / sesión", () => {
  test("checkout sin sesión muestra login requerido", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "venta-pc-cart",
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
        })
      );
    });

    await page.goto("/checkout");
    await expect(page.getByText(/iniciá sesión|iniciar sesión/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByLabel(/abrir carrito, \d+ productos/i)).toHaveCount(0);
  });

  test("health de Next responde", async ({ request }) => {
    const respuesta = await request.get("/api/health");
    // Puede ser 200 aunque la API remota esté caída
    expect(respuesta.status()).toBeLessThan(500);
  });
});
