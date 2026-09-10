import { describe, it } from "vitest";

import { LandingContent } from "@/components/landing/landing-content";
import { expectNoSeriousA11yViolations } from "@/test/a11y";
import { render } from "@testing-library/react";

describe("LandingContent a11y", () => {
  it("has no serious accessibility violations", async () => {
    const { container } = render(
      <LandingContent
        user={null}
        primaryHref="/login"
        secondaryHref="/login?next=/applications/new"
      />,
    );
    await expectNoSeriousA11yViolations(container);
  });
});
