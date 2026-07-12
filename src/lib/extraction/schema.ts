import { z } from "zod";

import type { JobExtraction } from "@/types/application";

const workModeSchema = z.enum(["Remote", "Hybrid", "Onsite"]);

export const jobExtractionSchema = z.object({
  company: z.string().nullable(),
  jobTitle: z.string().nullable(),
  location: z.string().nullable(),
  country: z.string().nullable(),
  workMode: workModeSchema.nullable(),
  employmentType: z.string().nullable(),
  salary: z.string().nullable(),
  applicationDeadline: z.string().nullable(),
  skills: z.array(z.string()).nullable(),
  technologies: z.array(z.string()).nullable(),
  experienceRequired: z.string().nullable(),
  education: z.string().nullable(),
  responsibilities: z.string().nullable(),
  qualifications: z.string().nullable(),
  benefits: z.string().nullable(),
  visaSponsorship: z.boolean().nullable(),
  recruiterName: z.string().nullable(),
  recruiterEmail: z.string().nullable(),
  recruiterPhone: z.string().nullable(),
  applyUrl: z.string().nullable(),
  companyWebsite: z.string().nullable(),
  summary: z.string().nullable(),
});

export const notJobPostingSchema = z.object({
  error: z.literal("not_a_job_posting"),
  message: z.string(),
});

export type ExtractionResult =
  | { ok: true; data: JobExtraction }
  | { ok: false; notJobPosting: { error: "not_a_job_posting"; message: string } }
  | { ok: false; invalid: true };

export function parseExtractionResponse(raw: string): ExtractionResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, invalid: true };
  }

  const notJob = notJobPostingSchema.safeParse(parsed);
  if (notJob.success) {
    return { ok: false, notJobPosting: notJob.data };
  }

  const extraction = jobExtractionSchema.safeParse(parsed);
  if (extraction.success) {
    return { ok: true, data: extraction.data };
  }

  return { ok: false, invalid: true };
}
