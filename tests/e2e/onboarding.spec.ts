import { expect, test } from "@playwright/test";

/**
 * Full onboarding flow in demo mode (no Supabase). The most fragile end-to-end
 * path: parent registration -> 5 onboarding steps -> child landing on the
 * lesson map with a personalized greeting.
 */
test.describe("Onboarding (demo)", () => {
  test("completa el onboarding en modo demo y llega al mapa de lecciones", async ({
    page,
  }) => {
    await page.goto("/registro");

    // --- Sign-up form (demo mode writes pianitos.demoParent + redirects) ---
    await page.getByLabel("Email del padre o madre").fill(
      "padre+e2e@example.com",
    );
    await page.getByLabel("Contrasena", { exact: true }).fill("secreta12");
    await page.getByLabel("Confirmar contrasena").fill("secreta12");

    // Consent checkbox: it has no accessible name of its own, the surrounding
    // label provides the description. The first (and only) checkbox in the
    // form is the consent one.
    await page.locator('input[type="checkbox"]').first().check();

    await page.getByRole("button", { name: "Crear cuenta" }).click();
    await page.waitForURL(/\/onboarding\/1/);

    // --- Step 1: welcome -> "Empezar" ---
    await page.getByRole("button", { name: "Empezar" }).click();
    await page.waitForURL(/\/onboarding\/2/);

    // --- Step 2: child name + age. UI label for the primary CTA is
    // "Siguiente" (the spec calls it "Continuar"; we use the actual button
    // accessible name to keep the test green without touching source). ---
    await page.getByLabel("Nombre del nino").fill("Sofia");
    await page.getByLabel("Edad").selectOption("8");
    await page.getByRole("button", { name: "Siguiente" }).click();
    await page.waitForURL(/\/onboarding\/3/);

    // --- Step 3: pick avatar a3 then advance ---
    await page.getByRole("radio", { name: "Elegir avatar a3" }).click();
    await page.getByRole("button", { name: "Siguiente" }).click();
    await page.waitForURL(/\/onboarding\/4/);

    // --- Step 4: pick "Yamaha PSR" then advance ---
    await page.getByRole("radio", { name: /Yamaha PSR/ }).click();
    await page.getByRole("button", { name: "Siguiente" }).click();
    await page.waitForURL(/\/onboarding\/5/);

    // --- Step 5: skip MIDI -> /nino/inicio ---
    await page.getByRole("button", { name: "Lo conecto despues" }).click();
    await page.waitForURL(/\/nino\/inicio/);

    // Personalized greeting renders in the lesson map.
    await expect(
      page.getByRole("heading", { name: /Sofia/, level: 1 }),
    ).toBeVisible();

    // "Mis medallas" link is visible in the header.
    await expect(
      page.getByRole("link", { name: "Mis medallas" }),
    ).toBeVisible();
  });
});
