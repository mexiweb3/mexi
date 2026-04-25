import { expect } from "@playwright/test";

import { test } from "./fixtures";

/**
 * Lesson runner + lesson map regressions. These rely on `seededPage` from
 * ./fixtures, which pre-populates localStorage so /nino/* doesn't bounce to
 * /onboarding/1.
 */

test.describe("Leccion m1l1 (find_note Do)", () => {
  test("abre la leccion 1 y completa el primer ejercicio find_note de Do", async ({
    seededPage,
  }) => {
    const page = seededPage;
    await page.goto("/nino/leccion/m1l1");

    // --- Step 1: intro ---
    await page.getByRole("button", { name: "Empezar" }).click();

    // --- Step 2: demo. The first click is a required user gesture for the
    // WebAudio context. Playing 1 note at 70bpm * 2 beats ~= 1.7s, after which
    // the "Continuar" button replaces the "Tocar demostracion" CTA. ---
    await page.getByRole("button", { name: "Tocar demostracion" }).click();
    const continuar = page.getByRole("button", { name: "Continuar" });
    await expect(continuar).toBeVisible({ timeout: 10_000 });
    await continuar.click();

    // --- Step 3: find_note exercise. Click the on-screen Do (C4) key. The
    // VirtualKeyboard exposes each key as a <button> with aria-label like
    // "Do 4". There are two octaves rendered starting at MIDI 48 (C3) so we
    // explicitly target "Do 4". ---
    await page.getByRole("button", { name: "Do 4", exact: true }).click();

    // --- Step 4: celebration. Configured message for m1l1 is
    // "Lo lograste. Tocaste tu primer Do." ---
    await expect(page.getByText(/Lo lograste/)).toBeVisible({
      timeout: 10_000,
    });

    // The map link is rendered as <a> with the accessible name "Volver al mapa".
    await expect(
      page.getByRole("link", { name: "Volver al mapa" }),
    ).toBeVisible();
  });
});

test.describe("Mapa de lecciones (premium)", () => {
  test("lecciones 6-10 estan marcadas como Premium en /nino/inicio", async ({
    seededPage,
  }) => {
    const page = seededPage;
    await page.goto("/nino/inicio");

    // Wait for the map to render before probing individual cards.
    await expect(
      page.getByRole("list", { name: "Mapa de lecciones" }),
    ).toBeVisible();

    const premiumLessons: ReadonlyArray<{ id: string; title: string }> = [
      { id: "m2l1", title: "El pulso del corazon" },
      { id: "m2l2", title: "Notas largas, notas cortas" },
      { id: "m2l3", title: "Manos al teclado" },
      { id: "m2l4", title: "Mi segunda cancion" },
      { id: "m2l5", title: "Mi primer concierto" },
    ];

    for (const lesson of premiumLessons) {
      // Locked lessons render as <div role="button" aria-disabled="true"
      // aria-label="Leccion bloqueada: <title>"> — the actionable wrapper is
      // NOT a link, ensuring the kid cannot navigate.
      const card = page.getByRole("button", {
        name: `Leccion bloqueada: ${lesson.title}`,
      });
      await expect(card).toBeVisible();
      await expect(card).toHaveAttribute("aria-disabled", "true");

      // Each locked card displays the "Premium" badge.
      await expect(
        card.getByText("Premium", { exact: true }),
      ).toBeVisible();

      // Sanity: there is no <a href="/nino/leccion/m2lX"> for these lessons.
      const link = page.locator(`a[href="/nino/leccion/${lesson.id}"]`);
      await expect(link).toHaveCount(0);
    }
  });
});
