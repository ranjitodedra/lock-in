import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function expectNoSeriousAxeViolations(
  page: import("@playwright/test").Page,
) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  const serious = results.violations.filter(
    (violation) =>
      violation.impact === "serious" || violation.impact === "critical",
  );

  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("landing page has no serious accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /track every job application/i }),
  ).toBeVisible();
  await expectNoSeriousAxeViolations(page);
});

test("login page has no serious accessibility violations", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Lock-In Tracker" }),
  ).toBeVisible();
  await expectNoSeriousAxeViolations(page);
});
