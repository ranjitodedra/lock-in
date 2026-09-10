import { describe, expect, it } from "vitest";

import {
  compareValues,
  DEFAULT_FILTERS,
  filterAndSortApplications,
  hasActiveFilters,
  matchesDeadlineRange,
  matchesSearch,
} from "@/lib/applications/dashboard-filters";
import { makeListRow } from "@/test/fixtures";

const acme = makeListRow({
  id: "1",
  company: "Acme",
  job_title: "Engineer",
  status: "Applied",
  work_mode: "Remote",
  skills: ["TypeScript"],
  created_at: "2026-09-01T12:00:00.000Z",
  application_deadline: "2026-10-01T00:00:00.000Z",
});

const globex = makeListRow({
  id: "2",
  company: "Globex",
  job_title: "Designer",
  status: "Wishlist",
  work_mode: "Hybrid",
  skills: ["Figma"],
  created_at: "2026-09-05T12:00:00.000Z",
  application_deadline: "2026-11-01T00:00:00.000Z",
});

describe("dashboard filters", () => {
  it("matches company, role, and skills search", () => {
    expect(matchesSearch(acme, "acme")).toBe(true);
    expect(matchesSearch(acme, "engineer")).toBe(true);
    expect(matchesSearch(acme, "typescript")).toBe(true);
    expect(matchesSearch(acme, "figma")).toBe(false);
    expect(matchesSearch(acme, "  ")).toBe(true);
  });

  it("filters deadline ranges inclusive of the calendar day", () => {
    expect(matchesDeadlineRange(acme, "2026-10-01", "")).toBe(true);
    expect(matchesDeadlineRange(acme, "2026-10-02", "")).toBe(false);
    expect(matchesDeadlineRange(acme, "", "2026-10-01")).toBe(true);
    expect(matchesDeadlineRange({ ...acme, application_deadline: null }, "2026-10-01", "")).toBe(
      false,
    );
  });

  it("sorts nulls last and created_at by time", () => {
    const withNull = makeListRow({ id: "3", company: null, created_at: "2026-08-01T12:00:00.000Z" });
    expect(compareValues(acme, globex, "company")).toBeLessThan(0);
    expect(compareValues(withNull, acme, "company")).toBeGreaterThan(0);
    expect(compareValues(acme, globex, "created_at")).toBeLessThan(0);
  });

  it("reports active filters", () => {
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, search: "acme" })).toBe(true);
  });

  it("filters and sorts a list", () => {
    const result = filterAndSortApplications(
      [acme, globex],
      { ...DEFAULT_FILTERS, status: "Applied" },
      "created_at",
      "desc",
    );
    expect(result.map((row) => row.id)).toEqual(["1"]);
  });
});
