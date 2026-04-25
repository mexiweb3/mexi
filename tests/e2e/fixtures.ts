import { test as base, type Page } from "@playwright/test";

/**
 * Demo profile shape — must mirror the runtime types in
 * /home/user/mexi/store/childProfile.ts and /home/user/mexi/store/onboarding.ts.
 */
export type DemoChild = {
  id: string;
  name: string;
  age: number;
  avatar: "a1" | "a2" | "a3" | "a4" | "a5" | "a6";
  keyboardBrand: "yamaha" | "casio" | "otro" | "ninguno" | null;
};

export const DEMO_CHILD: DemoChild = {
  id: "e2e-child-1",
  name: "Sofia",
  age: 8,
  avatar: "a3",
  keyboardBrand: "yamaha",
};

const DEMO_PARENT_KEY = "pianitos.demoParent";
const DEMO_CHILDREN_KEY = "pianitos.demoChildren";
const ACTIVE_CHILD_KEY = "pianitos.activeChild";

/**
 * Seeds localStorage so the app behaves as if the user already finished
 * onboarding in demo mode. Mirrors Zustand's `persist` envelope:
 * `{ state: <partializedState>, version }`.
 */
export async function seedDemoSession(
  page: Page,
  child: DemoChild = DEMO_CHILD,
): Promise<void> {
  await page.addInitScript(
    ({ parentKey, childrenKey, activeKey, c }) => {
      try {
        window.localStorage.setItem(
          parentKey,
          JSON.stringify({
            email: "padre+e2e@example.com",
            consentSignedAt: "2026-04-25T00:00:00Z",
          }),
        );
        window.localStorage.setItem(
          childrenKey,
          JSON.stringify([
            {
              id: c.id,
              name: c.name,
              age: c.age,
              avatar: c.avatar,
              keyboardBrand: c.keyboardBrand,
            },
          ]),
        );
        // Zustand persist envelope: must match `partialize` shape + `version`.
        window.localStorage.setItem(
          activeKey,
          JSON.stringify({
            state: {
              activeChild: {
                id: c.id,
                name: c.name,
                age: c.age,
                avatar: c.avatar,
                keyboardBrand: c.keyboardBrand,
              },
            },
            version: 1,
          }),
        );
      } catch {
        // localStorage may be unavailable — let the test surface the failure.
      }
    },
    {
      parentKey: DEMO_PARENT_KEY,
      childrenKey: DEMO_CHILDREN_KEY,
      activeKey: ACTIVE_CHILD_KEY,
      c: child,
    },
  );
}

type Fixtures = {
  seededPage: Page;
};

/**
 * `seededPage` — Playwright fixture that yields a Page with localStorage
 * pre-seeded so /nino/* routes don't bounce to /onboarding/1.
 */
export const test = base.extend<Fixtures>({
  seededPage: async ({ page }, use) => {
    await seedDemoSession(page);
    await use(page);
  },
});

export { expect } from "@playwright/test";
