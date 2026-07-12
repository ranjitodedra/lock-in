"use client";

import type { RefObject } from "react";
import Link from "next/link";
import { PlusCircle, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  type WorkMode,
} from "@/types/application";

export type DashboardFilters = {
  search: string;
  status: ApplicationStatus | "all";
  workMode: WorkMode | "all";
  deadlineFrom: string;
  deadlineTo: string;
};

type ApplicationsToolbarProps = {
  filters: DashboardFilters;
  totalCount: number;
  filteredCount: number;
  onFiltersChange: (filters: DashboardFilters) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  searchInputRef?: RefObject<HTMLInputElement | null>;
};

export function ApplicationsToolbar({
  filters,
  totalCount,
  filteredCount,
  onFiltersChange,
  onClearFilters,
  hasActiveFilters,
  searchInputRef,
}: ApplicationsToolbarProps) {
  function update<K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K],
  ) {
    onFiltersChange({ ...filters, [key]: value });
  }

  const countLabel =
    filteredCount === totalCount
      ? `${totalCount} application${totalCount === 1 ? "" : "s"}`
      : `${filteredCount} of ${totalCount}`;

  return (
    <div className="shrink-0 space-y-4 border-b border-border p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Applications</h2>
          <p className="text-sm text-muted-foreground">{countLabel}</p>
        </div>
        <Button
          variant="brand"
          render={<Link href="/applications/new" />}
          nativeButton={false}
        >
          <PlusCircle data-icon="inline-start" />
          New Application
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="relative min-w-[200px] flex-1">
          <Label htmlFor="dashboard-search" className="sr-only">
            Search applications
          </Label>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            id="dashboard-search"
            type="search"
            placeholder="Search company, role, skills…"
            aria-label="Search applications by company, role, or skills"
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            className="h-9 rounded-full pl-9"
          />
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <Select
            value={filters.status}
            onValueChange={(v) =>
              update("status", v as DashboardFilters["status"])
            }
          >
            <SelectTrigger className="h-9 w-[140px] rounded-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {APPLICATION_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.workMode}
            onValueChange={(v) =>
              update("workMode", v as DashboardFilters["workMode"])
            }
          >
            <SelectTrigger className="h-9 w-[130px] rounded-full">
              <SelectValue placeholder="All modes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modes</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
              <SelectItem value="Onsite">Onsite</SelectItem>
            </SelectContent>
          </Select>

          <Input
            id="deadline-from"
            type="date"
            aria-label="Deadline from"
            value={filters.deadlineFrom}
            onChange={(e) => update("deadlineFrom", e.target.value)}
            className="h-9 w-[150px] rounded-full"
          />

          <Input
            id="deadline-to"
            type="date"
            aria-label="Deadline to"
            value={filters.deadlineTo}
            onChange={(e) => update("deadlineTo", e.target.value)}
            className="h-9 w-[150px] rounded-full"
          />

          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-full"
              onClick={onClearFilters}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
