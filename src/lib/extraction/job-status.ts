import type { JobExtraction } from "@/types/application";
import { jobExtractionSchema } from "@/lib/extraction/schema";

export type ExtractionJobRow = {
  status: string;
  result: unknown;
  error_code: string | null;
  error_message: string | null;
};

export type ExtractionJobPollResponse =
  | { status: "pending" | "processing" }
  | { status: "completed"; data: JobExtraction }
  | { status: "failed"; error: string; message: string };

/** Maps a job row to the GET /api/extract/[jobId] JSON body. */
export function jobToPollResponse(
  job: ExtractionJobRow,
): ExtractionJobPollResponse {
  if (job.status === "pending" || job.status === "processing") {
    return { status: job.status };
  }

  if (job.status === "completed") {
    const parsed = jobExtractionSchema.safeParse(job.result);
    if (parsed.success) {
      return { status: "completed", data: parsed.data };
    }
    return {
      status: "failed",
      error: "extraction_failed",
      message: "Could not parse extraction result. Try again.",
    };
  }

  return {
    status: "failed",
    error: job.error_code ?? "extraction_failed",
    message:
      job.error_message ??
      "Extraction failed. Try again or fill in fields manually.",
  };
}
