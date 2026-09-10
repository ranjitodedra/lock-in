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

