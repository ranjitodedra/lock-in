import type { Database } from "@/types/database";

export const APPLICATION_STATUSES = [
  "Wishlist",
  "Preparing",
  "Applied",
  "OA",
  "Interview",
  "Offer",
  "Rejected",
  "Accepted",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type WorkMode = "Remote" | "Hybrid" | "Onsite";

export type JobExtraction = {
  company: string | null;
  jobTitle: string | null;
  location: string | null;
  country: string | null;
  workMode: WorkMode | null;
  employmentType: string | null;
  salary: string | null;
  applicationDeadline: string | null;
  skills: string[] | null;
  technologies: string[] | null;
  experienceRequired: string | null;
  education: string | null;
  responsibilities: string | null;
  qualifications: string | null;
  benefits: string | null;
  visaSponsorship: boolean | null;
  recruiterName: string | null;
  recruiterEmail: string | null;
  recruiterPhone: string | null;
  applyUrl: string | null;
  companyWebsite: string | null;
  summary: string | null;
};

export type ApplicationRow =
  Database["public"]["Tables"]["applications"]["Row"];
export type ApplicationInsert =
  Database["public"]["Tables"]["applications"]["Insert"];
export type ApplicationUpdate =
  Database["public"]["Tables"]["applications"]["Update"];

export type ApplicationListRow = Pick<
  ApplicationRow,
  | "id"
  | "user_id"
  | "status"
  | "company"
  | "job_title"
  | "location"
  | "country"
  | "work_mode"
  | "employment_type"
  | "salary"
  | "application_deadline"
  | "follow_up_date"
  | "applied_at"
  | "skills"
  | "technologies"
  | "created_at"
  | "updated_at"
>;

export type ExtractionUsageRow =
  Database["public"]["Tables"]["extraction_usage"]["Row"];
export type ExtractionUsageInsert =
  Database["public"]["Tables"]["extraction_usage"]["Insert"];
