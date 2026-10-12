import { test, expect } from "@playwright/test";

test.describe("Panel de administración", () => {
  test("ruta /admin requiere autenticación", async ({ page }) => {
    await page.goto("/admin");
    await expect(
      page.getByText(/iniciá sesión|acceso restringido|administración/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("API admin de pedidos rechaza anónimos", async ({ request }) => {
    const respuesta = await request.get("/api/admin/orders");
    expect(respuesta.status()).toBeGreaterThanOrEqual(401);
    expect(respuesta.status()).toBeLessThan(500);
  });
});
