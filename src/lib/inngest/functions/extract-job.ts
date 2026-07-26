import { eventType } from "inngest";
import { z } from "zod";

import { inngest } from "@/lib/inngest/client";
import { runExtraction } from "@/lib/extraction/run";
import { reportError } from "@/lib/monitoring";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

export const extractionRequested = eventType("extraction/requested", {
  schema: z.object({
    jobId: z.string().uuid(),
    userId: z.string().uuid(),
  }),
});

export const processExtractionJob = inngest.createFunction(
  {
    id: "process-extraction-job",
    retries: 2,
    triggers: [extractionRequested],
  },
  async ({ event, step }) => {
    const { jobId, userId } = event.data;

    await step.run("extract", async () => {
      const supabase = createAdminClient();

      const { data: job, error: loadError } = await supabase
        .from("extraction_jobs")
        .select("id, user_id, status, raw_description")
        .eq("id", jobId)
        .maybeSingle();

      if (loadError) {
        throw new Error(`Failed to load extraction job: ${loadError.message}`);
      }
      if (!job) {
        return { skipped: true, reason: "missing" };
      }
      if (job.user_id !== userId) {
        return { skipped: true, reason: "user_mismatch" };
      }
      // Idempotent: do not overwrite a terminal job on Inngest retry.
      if (job.status === "completed" || job.status === "failed") {
        return { skipped: true, reason: "terminal", status: job.status };
      }

      const now = new Date().toISOString();
      const { error: processingError } = await supabase
        .from("extraction_jobs")
        .update({ status: "processing", started_at: now })
        .eq("id", jobId)
        .in("status", ["pending", "processing"]);

      if (processingError) {
        throw new Error(
          `Failed to mark job processing: ${processingError.message}`,
        );
      }

      const result = await runExtraction({
        userId,
        rawDescription: job.raw_description,
      });

      const completedAt = new Date().toISOString();

      if (result.ok) {
        const { error: completeError } = await supabase
          .from("extraction_jobs")
          .update({
            status: "completed",
            result: result.data as unknown as Json,
            error_code: null,
            error_message: null,
            completed_at: completedAt,
          })
          .eq("id", jobId)
          .eq("status", "processing");

        if (completeError) {
          throw new Error(
            `Failed to complete extraction job: ${completeError.message}`,
          );
        }
        return { ok: true };
      }

      const { error: failError } = await supabase
        .from("extraction_jobs")
        .update({
          status: "failed",
          error_code: result.error,
          error_message: result.message,
          completed_at: completedAt,
        })
        .eq("id", jobId)
        .neq("status", "completed");

      if (failError) {
        reportError(failError, {
          route: "inngest/extract",
          step: "mark_failed",
        });
        throw new Error(
          `Failed to mark extraction job failed: ${failError.message}`,
        );
      }

      return { ok: false, error: result.error };
    });
  },
);
