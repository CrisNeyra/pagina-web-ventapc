import { test, expect } from "@playwright/test";

test.describe("Postulaciones", () => {
  test("formulario de trabajá con nosotros visible", async ({ page }) => {
    await page.goto("/trabaja-con-nosotros");
    await expect(page.getByRole("heading", { name: /trabajá con nosotros/i })).toBeVisible();
    await expect(page.getByLabel(/nombre/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/cv|curriculum/i)).toBeVisible();
  });
});
