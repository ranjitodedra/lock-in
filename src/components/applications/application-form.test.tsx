import type { ComponentProps } from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationForm } from "@/components/applications/application-form";
import { createApplication } from "@/lib/applications/actions";
import { emptyFormValues } from "@/lib/applications/form";
import { pollExtractionJob } from "@/lib/extraction/poll";
import { expectNoSeriousA11yViolations } from "@/test/a11y";
import { renderWithStore } from "@/test/render";

vi.mock("@/lib/applications/actions", () => ({
  createApplication: vi.fn(),
  updateApplication: vi.fn(),
}));

vi.mock("@/lib/extraction/poll", () => ({
  pollExtractionJob: vi.fn(),
}));

vi.mock("@/components/codex/login-with-chatgpt", () => ({
  LoginWithChatGPT: () => <div>Connect ChatGPT mock</div>,
}));

const mockedCreate = vi.mocked(createApplication);
const mockedPoll = vi.mocked(pollExtractionJob);

function renderForm(
  overrides: Partial<ComponentProps<typeof ApplicationForm>> = {},
) {
  return renderWithStore(
    <ApplicationForm
      mode="create"
      initialValues={emptyFormValues()}
      emailVerified
      chatGptConnected
      {...overrides}
    />,
  );
}

describe("ApplicationForm", () => {
  beforeEach(() => {
    mockedCreate.mockReset();
    mockedPoll.mockReset();
    vi.unstubAllGlobals();
  });

  it("lets the user paste a posting and extract editable fields", async () => {
    const user = userEvent.setup();
    let resolvePoll: (value: Awaited<ReturnType<typeof pollExtractionJob>>) => void =
      () => {};
    mockedPoll.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePoll = resolve;
        }),
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ jobId: "job-1" }),
      }),
    );

    renderForm({
      initialValues: {
        ...emptyFormValues(),
        raw_description: "Software Engineer at Acme. React, TypeScript.",
      },
    });

    await user.click(screen.getByRole("button", { name: /extract fields/i }));
    expect(await screen.findByRole("status")).toHaveTextContent(/extracting/i);
    expect(screen.getByRole("button", { name: /extracting/i })).toBeDisabled();

    resolvePoll({
      kind: "completed",
      data: {
        company: "Acme",
        jobTitle: "Software Engineer",
        location: null,
        country: null,
        workMode: null,
        employmentType: null,
        salary: null,
        applicationDeadline: null,
        skills: ["React"],
        technologies: null,
        experienceRequired: null,
        education: null,
        responsibilities: null,
        qualifications: null,
        benefits: null,
        visaSponsorship: null,
        recruiterName: null,
        recruiterEmail: null,
        recruiterPhone: null,
        applyUrl: null,
        companyWebsite: null,
        summary: null,
      },
    });

    const company = await screen.findByLabelText("Company");
    expect(company).toHaveValue("Acme");
    await user.clear(company);
    await user.type(company, "Acme Corp");
    expect(company).toHaveValue("Acme Corp");
  });

  it("can be filled and saved without ChatGPT", async () => {
    const user = userEvent.setup();
    mockedCreate.mockResolvedValue({ success: true });

    renderForm({ chatGptConnected: false });

    expect(
      screen.getByText(/connect chatgpt to extract fields/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /extract fields/i }),
    ).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Company"), "Manual Co");
    await user.click(screen.getByRole("button", { name: /save application/i }));

    await waitFor(() => {
      expect(mockedCreate).toHaveBeenCalled();
    });
    expect(mockedCreate.mock.calls[0]?.[0]).toMatchObject({
      company: "Manual Co",
    });
  });

  it("tells the user to fill fields manually when extract fails", async () => {
    const user = userEvent.setup();
    const { toast } = await import("sonner");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: "extraction_failed",
          message: "Extraction failed. Try again or fill in fields manually.",
        }),
      }),
    );

    renderForm({
      initialValues: {
        ...emptyFormValues(),
        raw_description: "Not extractable",
      },
    });

    await user.click(screen.getByRole("button", { name: /extract fields/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Extraction failed. Try again or fill in fields manually.",
      );
    });
  });

  it("has no serious accessibility violations", async () => {
    const { container } = renderForm();
    await expectNoSeriousA11yViolations(container);
  });
});
