"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ApplicationsTable } from "@/components/dashboard/applications-table";
import { ApplicationsToolbar } from "@/components/dashboard/applications-toolbar";
import { Button } from "@/components/ui/button";
import { useDashboardShortcuts } from "@/hooks/use-dashboard-shortcuts";
import { hasActiveFilters } from "@/lib/applications/dashboard-filters";
import {
  loadApplicationsPage,
  patchApplication,
  type PatchApplicationInput,
} from "@/lib/applications/actions";
import { useAppDispatch, useAppSelector, useAppStore } from "@/store/hooks";
import {
  appendPage,
  hydrateDashboard,
  loadMoreFailed,
  loadMoreStarted,
  patchFailed,
  patchFulfilled,
  patchStarted,
  selectFilteredApplications,
  setFilters,
  sortBy,
  clearFilters,
} from "@/store/slices/dashboard-slice";
import type { ApplicationListRow } from "@/types/application";

type ApplicationsDashboardProps = {
  applications: ApplicationListRow[];
  initialNextCursor: string | null;
  totalCount: number;
};

export function ApplicationsDashboard({
  applications: initialApplications,
  initialNextCursor,
  totalCount,
}: ApplicationsDashboardProps) {
  const router = useRouter();
  const store = useAppStore();
  const dispatch = useAppDispatch();
  const hydratedRef = useRef<boolean | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  if (hydratedRef.current == null) {
    hydratedRef.current = true;
    store.dispatch(
      hydrateDashboard({
        applications: initialApplications,
        nextCursor: initialNextCursor,
        totalCount,
      }),
    );
  }

  const applications = useAppSelector((state) => state.dashboard.applications);
  const nextCursor = useAppSelector((state) => state.dashboard.nextCursor);
  const storedTotalCount = useAppSelector((state) => state.dashboard.totalCount);
  const filters = useAppSelector((state) => state.dashboard.filters);
  const sortKey = useAppSelector((state) => state.dashboard.sortKey);
  const sortDir = useAppSelector((state) => state.dashboard.sortDir);
  const loadingMore = useAppSelector((state) => state.dashboard.loadingMore);
  const patchingId = useAppSelector((state) => state.dashboard.patchingId);
  const filtered = useAppSelector((state) =>
    selectFilteredApplications(state.dashboard),
  );

  useDashboardShortcuts(searchInputRef);

  const handlePatch = useCallback(
    async (id: string, patch: PatchApplicationInput) => {
      dispatch(patchStarted(id));
      const result = await patchApplication(id, patch);

      if ("error" in result) {
        dispatch(patchFailed());
        toast.error(result.error);
        return;
      }

      dispatch(patchFulfilled({ id, application: result.application }));
    },
    [dispatch],
  );

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;

    dispatch(loadMoreStarted());
    try {
      const page = await loadApplicationsPage(nextCursor);
      dispatch(
        appendPage({ items: page.items, nextCursor: page.nextCursor }),
      );
    } catch {
      dispatch(loadMoreFailed());
      toast.error("Could not load more applications.");
    }
  }, [dispatch, loadingMore, nextCursor]);

  const activeFilters = hasActiveFilters(filters);
  const loadedAll = applications.length >= storedTotalCount;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <ApplicationsToolbar
          filters={filters}
          totalCount={storedTotalCount}
          filteredCount={filtered.length}
          onFiltersChange={(next) => dispatch(setFilters(next))}
          onClearFilters={() => dispatch(clearFilters())}
          hasActiveFilters={activeFilters}
          searchInputRef={searchInputRef}
        />

        {activeFilters && !loadedAll ? (
          <p className="border-b border-border px-4 py-2 text-xs text-muted-foreground">
            Search and filters apply to loaded applications (
            {applications.length} of {storedTotalCount}).
          </p>
        ) : null}

        <div className="min-h-0 flex-1 overflow-auto">
          <ApplicationsTable
            applications={filtered}
            totalCount={storedTotalCount}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={(key) => dispatch(sortBy(key))}
            onSelect={(application) =>
              router.push(`/applications/${application.id}`)
            }
            onPatch={handlePatch}
            patchingId={patchingId}
            hasActiveFilters={activeFilters}
            onClearFilters={() => dispatch(clearFilters())}
          />
        </div>

        {nextCursor ? (
          <div className="border-t border-border px-4 py-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={loadingMore}
              onClick={handleLoadMore}
            >
              {loadingMore ? "Loading…" : "Load more"}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
