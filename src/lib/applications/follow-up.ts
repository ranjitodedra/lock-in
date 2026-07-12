import type { ApplicationStatus } from "@/types/application";

export const FOLLOW_UP_CALENDAR_DAYS = 14;

function formatDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayDateInput(): string {
  return formatDateInput(new Date());
}

export function addCalendarDays(start: Date, calendarDays: number): Date {
  const result = new Date(start);
  result.setDate(result.getDate() + calendarDays);
  return result;
}

export function suggestFollowUpDate(from: Date): string {
  return formatDateInput(
    addCalendarDays(from, FOLLOW_UP_CALENDAR_DAYS),
  );
}

export type AppliedFields = {
  applied_at: string | null;
  follow_up_date: string;
};

export function resolveAppliedFields(
  status: ApplicationStatus,
  appliedAt: string | null,
  followUpDate: string,
  previousStatus?: ApplicationStatus | null,
): AppliedFields {
  if (status !== "Applied") {
    return {
      applied_at: appliedAt,
      follow_up_date: followUpDate,
    };
  }

  const isTransitionToApplied =
    status === "Applied" && previousStatus !== "Applied";

  if (isTransitionToApplied) {
    const applied = todayDateInput();
    return {
      applied_at: applied,
      follow_up_date: suggestFollowUpDate(new Date(`${applied}T12:00:00`)),
    };
  }

  const resolvedAppliedAt = appliedAt?.trim() || todayDateInput();
  const resolvedFollowUp =
    followUpDate.trim() ||
    suggestFollowUpDate(new Date(`${resolvedAppliedAt}T12:00:00`));

  return {
    applied_at: resolvedAppliedAt,
    follow_up_date: resolvedFollowUp,
  };
}

export function runFollowUpSelfCheck(): void {
  const jan1 = new Date(2026, 0, 1);
  const jan15 = addCalendarDays(jan1, 14);
  console.assert(
    formatDateInput(jan15) === "2026-01-15",
    "14 calendar days from Jan 1 should be Jan 15",
  );

  const resolved = resolveAppliedFields("Applied", null, "", "Wishlist");
  console.assert(
    resolved.applied_at?.length === 10,
    "Applied transition with no applied_at should set today",
  );
  console.assert(
    resolved.follow_up_date.length === 10,
    "Applied transition with empty follow-up should suggest a date",
  );

  const withExisting = resolveAppliedFields(
    "Applied",
    "2026-01-01",
    "",
    "Applied",
  );
  console.assert(
    withExisting.follow_up_date === "2026-01-15",
    "follow-up should be 14 days after applied_at when staying Applied",
  );

  const unchanged = resolveAppliedFields("Wishlist", null, "");
  console.assert(
    unchanged.applied_at === null && unchanged.follow_up_date === "",
    "Non-Applied status should not mutate fields",
  );

  const custom = resolveAppliedFields(
    "Applied",
    "2026-01-01",
    "2026-02-01",
    "Applied",
  );
  console.assert(
    custom.follow_up_date === "2026-02-01",
    "Existing follow-up should be preserved when staying Applied",
  );

  const transition = resolveAppliedFields(
    "Applied",
    "2026-01-01",
    "2026-02-01",
    "Wishlist",
  );
  console.assert(
    transition.applied_at === todayDateInput(),
    "Transition to Applied should reset applied_at to today",
  );
  console.assert(
    transition.follow_up_date ===
      suggestFollowUpDate(new Date(`${todayDateInput()}T12:00:00`)),
    "Transition to Applied should recalculate follow-up from today",
  );
}

if (typeof process !== "undefined" && process.argv[1]?.includes("follow-up")) {
  runFollowUpSelfCheck();
  console.log("follow-up self-check passed");
}
