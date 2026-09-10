import { axe } from "vitest-axe";
import { expect } from "vitest";

type AxeViolation = {
  impact?: string | null;
};

export async function expectNoSeriousA11yViolations(
  container: HTMLElement,
): Promise<void> {
  const results = await axe(container, {
    rules: {
      "color-contrast": { enabled: false },
    },
  });

  const serious = results.violations.filter(
    (violation: AxeViolation) =>
      violation.impact === "serious" || violation.impact === "critical",
  );

  expect(serious).toEqual([]);
}
