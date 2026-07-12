import type {
  ApplicationInsert,
  ApplicationRow,
  ApplicationStatus,
  ApplicationUpdate,
  WorkMode,
} from "@/types/application";

export const MAX_RAW_DESCRIPTION = 32000;

export type VisaSponsorshipInput = "" | "yes" | "no";

export type ApplicationFormValues = {
  raw_description: string;
  company: string;
  job_title: string;
  status: ApplicationStatus;
  location: string;
  country: string;
  work_mode: WorkMode | "";
  application_deadline: string;
  follow_up_date: string;
  salary: string;
  employment_type: string;
  skills: string;
  technologies: string;
  experience_required: string;
  education: string;
  responsibilities: string;
  qualifications: string;
  benefits: string;
  summary: string;
  recruiter_name: string;
  recruiter_email: string;
  recruiter_phone: string;
  apply_url: string;
  company_website: string;
  visa_sponsorship: VisaSponsorshipInput;
  notes: string;
};

export function emptyFormValues(): ApplicationFormValues {
  return {
    raw_description: "",
    company: "",
    job_title: "",
    status: "Wishlist",
    location: "",
    country: "",
    work_mode: "",
    application_deadline: "",
    follow_up_date: "",
    salary: "",
    employment_type: "",
    skills: "",
    technologies: "",
    experience_required: "",
    education: "",
    responsibilities: "",
    qualifications: "",
    benefits: "",
    summary: "",
    recruiter_name: "",
    recruiter_email: "",
    recruiter_phone: "",
    apply_url: "",
    company_website: "",
    visa_sponsorship: "",
    notes: "",
  };
}

export function parseCommaList(value: string): string[] | null {
  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : null;
}

export function commaListFromArray(values: string[] | null | undefined): string {
  return values?.join(", ") ?? "";
}

export function parseVisaSponsorship(
  value: VisaSponsorshipInput,
): boolean | null {
  if (value === "yes") return true;
  if (value === "no") return false;
  return null;
}

export function visaSponsorshipFromBoolean(
  value: boolean | null | undefined,
): VisaSponsorshipInput {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "";
}

export function dateInputFromTimestamptz(
  value: string | null | undefined,
): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function timestamptzFromDateInput(value: string): string | null {
  if (!value.trim()) return null;
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

export function dateInputFromDate(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function nullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function sharedDbFields(
  values: ApplicationFormValues,
): Omit<ApplicationInsert, "user_id"> {
  return {
    raw_description: nullableText(values.raw_description),
    company: nullableText(values.company),
    job_title: nullableText(values.job_title),
    status: values.status,
    location: nullableText(values.location),
    country: nullableText(values.country),
    work_mode: values.work_mode || null,
    application_deadline: timestamptzFromDateInput(values.application_deadline),
    follow_up_date: values.follow_up_date.trim() || null,
    salary: nullableText(values.salary),
    employment_type: nullableText(values.employment_type),
    skills: parseCommaList(values.skills),
    technologies: parseCommaList(values.technologies),
    experience_required: nullableText(values.experience_required),
    education: nullableText(values.education),
    responsibilities: nullableText(values.responsibilities),
    qualifications: nullableText(values.qualifications),
    benefits: nullableText(values.benefits),
    summary: nullableText(values.summary),
    recruiter_name: nullableText(values.recruiter_name),
    recruiter_email: nullableText(values.recruiter_email),
    recruiter_phone: nullableText(values.recruiter_phone),
    apply_url: nullableText(values.apply_url),
    company_website: nullableText(values.company_website),
    visa_sponsorship: parseVisaSponsorship(values.visa_sponsorship),
    notes: nullableText(values.notes),
  };
}

export function rowToFormValues(row: ApplicationRow): ApplicationFormValues {
  return {
    raw_description: row.raw_description ?? "",
    company: row.company ?? "",
    job_title: row.job_title ?? "",
    status: row.status as ApplicationStatus,
    location: row.location ?? "",
    country: row.country ?? "",
    work_mode: (row.work_mode as WorkMode | null) ?? "",
    application_deadline: dateInputFromTimestamptz(row.application_deadline),
    follow_up_date: dateInputFromDate(row.follow_up_date),
    salary: row.salary ?? "",
    employment_type: row.employment_type ?? "",
    skills: commaListFromArray(row.skills),
    technologies: commaListFromArray(row.technologies),
    experience_required: row.experience_required ?? "",
    education: row.education ?? "",
    responsibilities: row.responsibilities ?? "",
    qualifications: row.qualifications ?? "",
    benefits: row.benefits ?? "",
    summary: row.summary ?? "",
    recruiter_name: row.recruiter_name ?? "",
    recruiter_email: row.recruiter_email ?? "",
    recruiter_phone: row.recruiter_phone ?? "",
    apply_url: row.apply_url ?? "",
    company_website: row.company_website ?? "",
    visa_sponsorship: visaSponsorshipFromBoolean(row.visa_sponsorship),
    notes: row.notes ?? "",
  };
}

export function formValuesToInsert(
  values: ApplicationFormValues,
  userId: string,
  appliedAt: string | null = null,
): ApplicationInsert {
  return {
    user_id: userId,
    ...sharedDbFields(values),
    applied_at: appliedAt,
  };
}

export function formValuesToUpdate(
  values: ApplicationFormValues,
  appliedAt: string | null | undefined = undefined,
): ApplicationUpdate {
  const fields = sharedDbFields(values);
  if (appliedAt !== undefined) {
    return { ...fields, applied_at: appliedAt };
  }
  return fields;
}

export function validateFormValues(
  values: ApplicationFormValues,
): string | null {
  if (values.raw_description.length > MAX_RAW_DESCRIPTION) {
    return `Job description must be ${MAX_RAW_DESCRIPTION.toLocaleString()} characters or fewer.`;
  }
  return null;
}
