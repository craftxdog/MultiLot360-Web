import { expect, test } from "@playwright/test";

test.describe("selector de tema responsive", () => {
  test("aparece y cambia el tema en un dispositivo movil", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/login");

    const selector = page.getByLabel("Seleccionar tema");
    await expect(selector).toBeVisible();
    await expect(page.getByRole("button", { name: "Tema Claro" })).toBeHidden();

    await selector.selectOption("light");
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    await selector.selectOption("dark");
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("muestra el control completo en escritorio", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/login");

    await expect(page.getByLabel("Seleccionar tema")).toBeHidden();
    const lightTheme = page.getByRole("button", { name: "Tema Claro" });
    await expect(lightTheme).toBeVisible();

    await lightTheme.click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });
});
