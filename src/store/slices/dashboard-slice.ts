import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  DEFAULT_FILTERS,
  filterAndSortApplications,
  type DashboardFilters,
  type SortDir,
  type SortKey,
} from "@/lib/applications/dashboard-filters";
import type { ApplicationListRow, ApplicationRow } from "@/types/application";

export type DashboardState = {
  applications: ApplicationListRow[];
  nextCursor: string | null;
  totalCount: number;
  filters: DashboardFilters;
  sortKey: SortKey;
  sortDir: SortDir;
  loadingMore: boolean;
  patchingId: string | null;
};

export const dashboardInitialState: DashboardState = {
  applications: [],
  nextCursor: null,
  totalCount: 0,
  filters: DEFAULT_FILTERS,
  sortKey: "created_at",
  sortDir: "desc",
  loadingMore: false,
  patchingId: null,
};

export type DashboardHydratePayload = {
  applications: ApplicationListRow[];
  nextCursor: string | null;
  totalCount: number;
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: dashboardInitialState,
  reducers: {
    hydrate(state, action: PayloadAction<DashboardHydratePayload>) {
      state.applications = action.payload.applications;
      state.nextCursor = action.payload.nextCursor;
      state.totalCount = action.payload.totalCount;
      state.loadingMore = false;
      state.patchingId = null;
    },
    setFilters(state, action: PayloadAction<DashboardFilters>) {
      state.filters = action.payload;
    },
    clearFilters(state) {
      state.filters = DEFAULT_FILTERS;
    },
    sortBy(state, action: PayloadAction<SortKey>) {
      if (state.sortKey === action.payload) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        return;
      }
      state.sortKey = action.payload;
      state.sortDir = "asc";
    },
    patchStarted(state, action: PayloadAction<string>) {
      state.patchingId = action.payload;
    },
    patchFailed(state) {
      state.patchingId = null;
    },
    patchFulfilled(
      state,
      action: PayloadAction<{ id: string; application: ApplicationRow }>,
    ) {
      state.patchingId = null;
      state.applications = state.applications.map((app) =>
        app.id === action.payload.id
          ? { ...app, ...action.payload.application }
          : app,
      );
    },
    loadMoreStarted(state) {
      state.loadingMore = true;
    },
    loadMoreFailed(state) {
      state.loadingMore = false;
    },
    appendPage(
      state,
      action: PayloadAction<{
        items: ApplicationListRow[];
        nextCursor: string | null;
      }>,
    ) {
      state.applications = [...state.applications, ...action.payload.items];
      state.nextCursor = action.payload.nextCursor;
      state.loadingMore = false;
    },
  },
});

export const {
  hydrate: hydrateDashboard,
  setFilters,
  clearFilters,
  sortBy,
  patchStarted,
  patchFailed,
  patchFulfilled,
  loadMoreStarted,
  loadMoreFailed,
  appendPage,
} = dashboardSlice.actions;

export const selectFilteredApplications = createSelector(
  [
    (state: DashboardState) => state.applications,
    (state: DashboardState) => state.filters,
    (state: DashboardState) => state.sortKey,
    (state: DashboardState) => state.sortDir,
  ],
  filterAndSortApplications,
);

export default dashboardSlice.reducer;
