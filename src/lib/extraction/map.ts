import {
  commaListFromArray,
  dateInputFromDate,
  type ApplicationFormValues,
  visaSponsorshipFromBoolean,
} from "@/lib/applications/form";
import type { JobExtraction } from "@/types/application";

function textOrEmpty(value: string | null | undefined): string {
  return value ?? "";
}

export function extractionToFormValues(
  extraction: JobExtraction,
  current: ApplicationFormValues,
): ApplicationFormValues {
  return {
    raw_description: current.raw_description,
    status: current.status,
    follow_up_date: current.follow_up_date,
    notes: current.notes,
    company: textOrEmpty(extraction.company),
    job_title: textOrEmpty(extraction.jobTitle),
    location: textOrEmpty(extraction.location),
    country: textOrEmpty(extraction.country),
    work_mode: extraction.workMode ?? "",
    application_deadline: dateInputFromDate(extraction.applicationDeadline),
    salary: textOrEmpty(extraction.salary),
    employment_type: textOrEmpty(extraction.employmentType),
    skills: commaListFromArray(extraction.skills),
    technologies: commaListFromArray(extraction.technologies),
    experience_required: textOrEmpty(extraction.experienceRequired),
    education: textOrEmpty(extraction.education),
    responsibilities: textOrEmpty(extraction.responsibilities),
    qualifications: textOrEmpty(extraction.qualifications),
    benefits: textOrEmpty(extraction.benefits),
    summary: textOrEmpty(extraction.summary),
    recruiter_name: textOrEmpty(extraction.recruiterName),
    recruiter_email: textOrEmpty(extraction.recruiterEmail),
    recruiter_phone: textOrEmpty(extraction.recruiterPhone),
    apply_url: textOrEmpty(extraction.applyUrl),
    company_website: textOrEmpty(extraction.companyWebsite),
    visa_sponsorship: visaSponsorshipFromBoolean(extraction.visaSponsorship),
  };
}
