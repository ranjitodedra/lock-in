export const EMPTY_VALUE = "—";

const DISPLAY_LOCALE = "en-US";

function formatPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  return parts.find((part) => part.type === type)?.value ?? "";
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return EMPTY_VALUE;
  return new Intl.DateTimeFormat(DISPLAY_LOCALE, { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return EMPTY_VALUE;

  const parts = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(new Date(value));

  const period = formatPart(parts, "dayPeriod").toUpperCase();
  return `${formatPart(parts, "month")} ${formatPart(parts, "day")}, ${formatPart(parts, "year")}, ${formatPart(parts, "hour")}:${formatPart(parts, "minute")} ${period}`;
}

export function formatText(value: string | null | undefined): string {
  if (!value?.trim()) return EMPTY_VALUE;
  return value;
}

export function formatList(values: string[] | null | undefined): string {
  if (!values?.length) return EMPTY_VALUE;
  return values.join(", ");
}

export function formatBoolean(value: boolean | null | undefined): string {
  if (value === null || value === undefined) return EMPTY_VALUE;
  return value ? "Yes" : "No";
}
