import { describe, expect, it } from "vitest";

import { DEFAULT_FILTERS } from "@/lib/applications/dashboard-filters";
import { makeApplicationRow, makeListRow } from "@/test/fixtures";
import { makeStore } from "@/store";
import {
  appendPage,
  clearFilters,
  dashboardInitialState,
  hydrateDashboard,
  patchFailed,
  patchFulfilled,
  patchStarted,
  selectFilteredApplications,
  setFilters,
  sortBy,
} from "@/store/slices/dashboard-slice";

describe("dashboard slice", () => {
  it("hydrates from server props", () => {
    const store = makeStore();
    const rows = [makeListRow(), makeListRow({ id: "app-2", company: "Globex" })];
    store.dispatch(
      hydrateDashboard({
        applications: rows,
        nextCursor: "cursor-1",
        totalCount: 10,
      }),
    );
    expect(store.getState().dashboard.applications).toHaveLength(2);
    expect(store.getState().dashboard.nextCursor).toBe("cursor-1");
    expect(store.getState().dashboard.totalCount).toBe(10);
  });

  it("merges a successful patch and clears patchingId", () => {
    const row = makeListRow({ status: "Wishlist" });
    const store = makeStore({
      dashboard: {
        ...dashboardInitialState,
        applications: [row],
      },
    });
    store.dispatch(patchStarted(row.id));
    store.dispatch(
      patchFulfilled({
        id: row.id,
        application: makeApplicationRow({ id: row.id, status: "Applied" }),
      }),
    );
    expect(store.getState().dashboard.patchingId).toBeNull();
    expect(store.getState().dashboard.applications[0]?.status).toBe("Applied");
  });

  it("clears patchingId on failure", () => {
    const store = makeStore({
      dashboard: { ...dashboardInitialState, patchingId: "app-1" },
    });
    store.dispatch(patchFailed());
    expect(store.getState().dashboard.patchingId).toBeNull();
  });

  it("appends a page and filters/sorts in the selector", () => {
    const first = makeListRow({
      id: "a",
      company: "Acme",
      status: "Applied",
      created_at: "2026-09-01T00:00:00.000Z",
    });
    const second = makeListRow({
      id: "b",
      company: "Globex",
      status: "Wishlist",
      created_at: "2026-09-02T00:00:00.000Z",
    });
    const store = makeStore({
      dashboard: {
        ...dashboardInitialState,
        applications: [first],
        nextCursor: "c1",
      },
    });
    store.dispatch(appendPage({ items: [second], nextCursor: null }));
    expect(store.getState().dashboard.applications).toHaveLength(2);
    expect(store.getState().dashboard.nextCursor).toBeNull();

    store.dispatch(setFilters({ ...DEFAULT_FILTERS, search: "globex" }));
    expect(selectFilteredApplications(store.getState().dashboard).map((row) => row.id)).toEqual([
      "b",
    ]);

    store.dispatch(clearFilters());
    store.dispatch(sortBy("company"));
    expect(selectFilteredApplications(store.getState().dashboard).map((row) => row.id)).toEqual([
      "a",
      "b",
    ]);
  });
});
