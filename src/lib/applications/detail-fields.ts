import {
  formatBoolean,
  formatDate,
  formatDateTime,
  formatList,
  formatText,
  EMPTY_VALUE,
} from "@/lib/applications/format";
import type { ApplicationRow } from "@/types/application";

export type DetailField = {
  label: string;
  value: string;
  multiline?: boolean;
  href?: string;
};

export type DetailSection = {
  title: string;
  fields: DetailField[];
};

function urlField(
  label: string,
  value: string | null | undefined,
): DetailField {
  const text = formatText(value);
  const href =
    value?.trim() && text !== EMPTY_VALUE ? value.trim() : undefined;
  return { label, value: text, href };
}

export function buildDetailSections(app: ApplicationRow): DetailSection[] {
  return [
    {
      title: "Overview",
      fields: [
        { label: "Location", value: formatText(app.location) },
        { label: "Country", value: formatText(app.country) },
        { label: "Work mode", value: formatText(app.work_mode) },
        { label: "Employment type", value: formatText(app.employment_type) },
        { label: "Salary", value: formatText(app.salary) },
        { label: "Deadline", value: formatDate(app.application_deadline) },
        { label: "Follow-up date", value: formatDate(app.follow_up_date) },
        {
          label: "Visa sponsorship",
          value: formatBoolean(app.visa_sponsorship),
        },
      ],
    },
    {
      title: "Role",
      fields: [
        { label: "Summary", value: formatText(app.summary), multiline: true },
        {
          label: "Responsibilities",
          value: formatText(app.responsibilities),
          multiline: true,
        },
        {
          label: "Qualifications",
          value: formatText(app.qualifications),
          multiline: true,
        },
        {
          label: "Experience required",
          value: formatText(app.experience_required),
          multiline: true,
        },
        {
          label: "Education",
          value: formatText(app.education),
          multiline: true,
        },
        {
          label: "Benefits",
          value: formatText(app.benefits),
          multiline: true,
        },
      ],
    },
    {
      title: "Skills",
      fields: [
        { label: "Skills", value: formatList(app.skills) },
        { label: "Technologies", value: formatList(app.technologies) },
      ],
    },
    {
      title: "Contact",
      fields: [
        { label: "Recruiter name", value: formatText(app.recruiter_name) },
        { label: "Recruiter email", value: formatText(app.recruiter_email) },
        { label: "Recruiter phone", value: formatText(app.recruiter_phone) },
        urlField("Apply URL", app.apply_url),
        urlField("Company website", app.company_website),
      ],
    },
    {
      title: "Other",
      fields: [
        { label: "Notes", value: formatText(app.notes), multiline: true },
        { label: "Date added", value: formatDateTime(app.created_at) },
        { label: "Last updated", value: formatDateTime(app.updated_at) },
      ],
    },
  ];
}

export function formatPastedDescription(
  raw: string | null | undefined,
): string {
  return formatText(raw);
}
