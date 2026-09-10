import type { ApplicationListRow, ApplicationRow } from "@/types/application";

export function makeListRow(
  overrides: Partial<ApplicationListRow> = {},
): ApplicationListRow {
  return {
    id: "app-1",
    user_id: "user-1",
    status: "Wishlist",
    company: "Acme",
    job_title: "Engineer",
    location: "New York",
    country: "US",
    work_mode: "Remote",
    employment_type: "Full-time",
    salary: "$120k",
    application_deadline: "2026-10-01T00:00:00.000Z",
    follow_up_date: null,
    applied_at: null,
    skills: ["TypeScript"],
    technologies: ["React"],
    created_at: "2026-09-01T12:00:00.000Z",
    updated_at: "2026-09-01T12:00:00.000Z",
    ...overrides,
  };
}

export function makeApplicationRow(
  overrides: Partial<ApplicationRow> = {},
): ApplicationRow {
  return {
    ...makeListRow(),
    raw_description: "A job posting",
    experience_required: null,
    education: null,
    responsibilities: null,
    qualifications: null,
    benefits: null,
    summary: null,
    recruiter_name: null,
    recruiter_email: null,
    recruiter_phone: null,
    apply_url: null,
    company_website: null,
    visa_sponsorship: null,
    notes: null,
    ...overrides,
  } as ApplicationRow;
}
