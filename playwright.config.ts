import { defineConfig } from "@playwright/test";

const CI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!CI,
  retries: CI ? 2 : 0,
  reporter: "list",
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !CI,
    timeout: 120_000,
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        // Pixel-ish mobile-first viewport.
        viewport: { width: 390, height: 780 },
      },
    },
    {
      name: "chromium-desktop",
      use: {
        // Used by tests that need a wider viewport (e.g. MIDI keyboard).
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
});
