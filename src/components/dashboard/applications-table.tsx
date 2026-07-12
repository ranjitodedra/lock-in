"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { fadeUp, motionTransition } from "@/components/motion/motion-presets";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PatchApplicationInput } from "@/lib/applications/actions";
import {
  EMPTY_VALUE,
  formatDateTime,
  formatText,
} from "@/lib/applications/format";
import { dateInputFromDate } from "@/lib/applications/form";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import {
  APPLICATION_STATUSES,
  type ApplicationListRow,
  type ApplicationStatus,
} from "@/types/application";

export type SortKey =
  | "company"
  | "job_title"
  | "status"
  | "salary"
  | "follow_up_date"
  | "created_at";

export type SortDir = "asc" | "desc";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "company", label: "Company" },
  { key: "job_title", label: "Role" },
  { key: "status", label: "Status" },
  { key: "salary", label: "Money" },
  { key: "created_at", label: "Date Added" },
  { key: "follow_up_date", label: "Follow-up" },
];

type ApplicationsTableProps = {
  applications: ApplicationListRow[];
  totalCount: number;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  onSelect: (application: ApplicationListRow) => void;
  onPatch: (id: string, patch: PatchApplicationInput) => void;
  patchingId: string | null;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

function stopRowClick(e: React.SyntheticEvent) {
  e.stopPropagation();
}

function SortIcon({
  column,
  sortKey,
  sortDir,
}: {
  column: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
}) {
  if (column !== sortKey) {
    return <ArrowUpDown className="size-3.5 text-muted-foreground" />;
  }
  return sortDir === "asc" ? (
    <ArrowUp className="size-3.5" />
  ) : (
    <ArrowDown className="size-3.5" />
  );
}

const MotionTableRow = motion.create(TableRow);

export function ApplicationsTable({
  applications,
  totalCount,
  sortKey,
  sortDir,
  onSort,
  onSelect,
  onPatch,
  patchingId,
  hasActiveFilters,
  onClearFilters,
}: ApplicationsTableProps) {
  const reducedMotion = useReducedMotion();
  const transition = motionTransition(reducedMotion, 0.3);
  const [animateRows, setAnimateRows] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateRows(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (totalCount === 0) {
    return (
      <motion.div
        className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={transition}
      >
        <p className="text-sm font-medium">No applications yet</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Paste a job description to extract details with your ChatGPT account,
          or add an application manually.
        </p>
        <Button variant="brand" className="mt-6" render={<Link href="/applications/new" />} nativeButton={false}>
          New application
        </Button>
      </motion.div>
    );
  }

  if (applications.length === 0) {
    return (
      <motion.div
        className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={transition}
      >
        <p className="text-sm font-medium">No matches</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Try adjusting your search or filters.
        </p>
        {hasActiveFilters ? (
          <Button className="mt-4" variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        ) : null}
      </motion.div>
    );
  }

  return (
    <Table aria-label="Applications">
      <TableHeader>
        <TableRow className="border-b border-border bg-muted/30 hover:bg-muted/30">
          {COLUMNS.map(({ key, label }) => (
            <TableHead
              key={key}
              className={cn("h-11", key === "company" && "pl-5 pr-4")}
                aria-sort={
                  sortKey === key
                    ? sortDir === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <button
                  type="button"
                  onClick={() => onSort(key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 font-medium transition-colors hover:text-foreground",
                    sortKey === key
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {label}
                  <SortIcon column={key} sortKey={sortKey} sortDir={sortDir} />
                </button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app, index) => {
            const isPatching = patchingId === app.id;
            const shouldAnimate = animateRows && !reducedMotion;

            return (
              <MotionTableRow
                key={app.id}
                tabIndex={0}
                role="button"
                className="cursor-pointer hover:bg-muted/20"
                initial={shouldAnimate ? "hidden" : false}
                animate="visible"
                variants={fadeUp}
                transition={{
                  ...transition,
                  delay: shouldAnimate ? index * 0.04 : 0,
                }}
                onClick={() => onSelect(app)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(app);
                  }
                }}
              >
                <TableCell className="py-3 pl-5 pr-4 font-bold">
                  {formatText(app.company)}
                </TableCell>
                <TableCell className="py-3">{formatText(app.job_title)}</TableCell>
                <TableCell className="py-3" onClick={stopRowClick} onPointerDown={stopRowClick}>
                  <Select
                    value={app.status}
                    disabled={isPatching}
                    onValueChange={(value) =>
                      onPatch(app.id, { status: value as ApplicationStatus })
                    }
                  >
                    <SelectTrigger
                      className="h-8 w-[130px] border-transparent bg-transparent shadow-none hover:bg-muted/50"
                      onClick={stopRowClick}
                      onPointerDown={stopRowClick}
                    >
                      <StatusBadge status={app.status as ApplicationStatus} />
                    </SelectTrigger>
                    <SelectContent>
                      {APPLICATION_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="py-3">{formatText(app.salary)}</TableCell>
                <TableCell className="py-3">{formatDateTime(app.created_at)}</TableCell>
                <TableCell className="py-3" onClick={stopRowClick} onPointerDown={stopRowClick}>
                  {app.applied_at ? (
                    <Input
                      type="date"
                      className="h-8 w-[140px]"
                      disabled={isPatching}
                      value={dateInputFromDate(app.follow_up_date)}
                      onClick={stopRowClick}
                      onPointerDown={stopRowClick}
                      onChange={(e) =>
                        onPatch(app.id, { follow_up_date: e.target.value })
                      }
                    />
                  ) : (
                    <span className="text-muted-foreground">{EMPTY_VALUE}</span>
                  )}
                </TableCell>
              </MotionTableRow>
            );
          })}
        </TableBody>
      </Table>
  );
}
