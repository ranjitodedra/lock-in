import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationsDashboard } from "@/components/dashboard/applications-dashboard";
import {
  loadApplicationsPage,
  patchApplication,
} from "@/lib/applications/actions";
import { expectNoSeriousA11yViolations } from "@/test/a11y";
import { makeApplicationRow, makeListRow } from "@/test/fixtures";
import { renderWithStore } from "@/test/render";

vi.mock("@/lib/applications/actions", () => ({
  patchApplication: vi.fn(),
  loadApplicationsPage: vi.fn(),
}));

const mockedPatch = vi.mocked(patchApplication);
const mockedLoadMore = vi.mocked(loadApplicationsPage);

const rows = [
  makeListRow({
    id: "app-1",
    company: "Acme",
    job_title: "Engineer",
    status: "Wishlist",
    skills: ["TypeScript"],
    created_at: "2026-09-01T12:00:00.000Z",
  }),
  makeListRow({
    id: "app-2",
    company: "Globex",
    job_title: "Designer",
    status: "Applied",
    skills: ["Figma"],
    created_at: "2026-09-02T12:00:00.000Z",
  }),
];

describe("ApplicationsDashboard", () => {
  beforeEach(() => {
    mockedPatch.mockReset();
    mockedLoadMore.mockReset();
  });

  it("filters the loaded table by search", async () => {
    const user = userEvent.setup();
    renderWithStore(
      <ApplicationsDashboard
        applications={rows}
        initialNextCursor={null}
        totalCount={2}
      />,
    );

    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeInTheDocument();

    await user.type(
      screen.getByRole("searchbox", {
        name: /search applications by company, role, or skills/i,
      }),
      "globex",
    );

    expect(screen.queryByText("Engineer")).not.toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeInTheDocument();
  });

  it("sorts by company when the column header is clicked", async () => {
    const user = userEvent.setup();
    renderWithStore(
      <ApplicationsDashboard
        applications={rows}
        initialNextCursor={null}
        totalCount={2}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Company" }));
    const table = screen.getByRole("table", { name: "Applications" });
    const companies = within(table)
      .getAllByRole("link")
      .map((link) => link.textContent);
    expect(companies).toEqual(["Acme", "Globex"]);
  });

  it("loads more rows via the server action", async () => {
    const user = userEvent.setup();
    mockedLoadMore.mockResolvedValue({
      items: [
        makeListRow({
          id: "app-3",
          company: "Initech",
          job_title: "Analyst",
        }),
      ],
      nextCursor: null,
      totalCount: 3,
    });

    renderWithStore(
      <ApplicationsDashboard
        applications={rows}
        initialNextCursor="cursor-1"
        totalCount={3}
      />,
    );

    await user.click(screen.getByRole("button", { name: /load more/i }));
    expect(await screen.findByText("Initech")).toBeInTheDocument();
    expect(mockedLoadMore).toHaveBeenCalledWith("cursor-1");
  });

  it("patches status after the server action returns", async () => {
    const user = userEvent.setup();
    mockedPatch.mockResolvedValue({
      success: true,
      application: makeApplicationRow({ id: "app-1", status: "OA" }),
    });

    renderWithStore(
      <ApplicationsDashboard
        applications={rows}
        initialNextCursor={null}
        totalCount={2}
      />,
    );

    await user.click(
      screen.getByRole("combobox", { name: /status for acme/i }),
    );
    await user.click(await screen.findByRole("option", { name: "OA" }));

    await waitFor(() => {
      expect(mockedPatch).toHaveBeenCalledWith("app-1", { status: "OA" });
    });
  });

  it("has no serious accessibility violations", async () => {
    const { container } = renderWithStore(
      <main>
        <ApplicationsDashboard
          applications={rows}
          initialNextCursor={null}
          totalCount={2}
        />
      </main>,
    );

    await expectNoSeriousA11yViolations(container);
  });
});
