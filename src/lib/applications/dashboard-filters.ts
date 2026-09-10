import type { ApplicationListRow } from "@/types/application";
import type { ApplicationStatus, WorkMode } from "@/types/application";

export type SortKey =
  | "company"
  | "job_title"
  | "status"
  | "salary"
  | "follow_up_date"
  | "created_at";

export type SortDir = "asc" | "desc";

export type DashboardFilters = {
  search: string;
  status: ApplicationStatus | "all";
  workMode: WorkMode | "all";
  deadlineFrom: string;
  deadlineTo: string;
};

export const DEFAULT_FILTERS: DashboardFilters = {
  search: "",
  status: "all",
  workMode: "all",
  deadlineFrom: "",
  deadlineTo: "",
};

export function matchesSearch(app: ApplicationListRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  if (app.company?.toLowerCase().includes(q)) return true;
  if (app.job_title?.toLowerCase().includes(q)) return true;
  if (app.skills?.some((skill) => skill.toLowerCase().includes(q))) return true;

  return false;
}

export function matchesDeadlineRange(
  app: ApplicationListRow,
  from: string,
  to: string,
): boolean {
  if (!from && !to) return true;
  if (!app.application_deadline) return false;

  const deadline = new Date(app.application_deadline);

  if (from) {
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    if (deadline < start) return false;
  }

  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    if (deadline > end) return false;
  }

  return true;
}

export function compareValues(
  a: ApplicationListRow,
  b: ApplicationListRow,
  key: SortKey,
): number {
  const av = a[key];
  const bv = b[key];

  if (av == null && bv == null) return 0;
  if (av == null) return 1;
  if (bv == null) return -1;

  if (key === "created_at") {
    return new Date(av as string).getTime() - new Date(bv as string).getTime();
  }

  if (key === "follow_up_date") {
    return new Date(av as string).getTime() - new Date(bv as string).getTime();
  }

  return String(av).localeCompare(String(bv));
}

export function hasActiveFilters(filters: DashboardFilters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.workMode !== "all" ||
    filters.deadlineFrom !== "" ||
    filters.deadlineTo !== ""
  );
}

export function filterAndSortApplications(
  applications: ApplicationListRow[],
  filters: DashboardFilters,
  sortKey: SortKey,
  sortDir: SortDir,
): ApplicationListRow[] {
  const result = applications.filter(
    (app) =>
      matchesSearch(app, filters.search) &&
      (filters.status === "all" || app.status === filters.status) &&
      (filters.workMode === "all" || app.work_mode === filters.workMode) &&
      matchesDeadlineRange(app, filters.deadlineFrom, filters.deadlineTo),
  );

  return [...result].sort((a, b) => {
    const cmp = compareValues(a, b, sortKey);
    return sortDir === "asc" ? cmp : -cmp;
  });
}
