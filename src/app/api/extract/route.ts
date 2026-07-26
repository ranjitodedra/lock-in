import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth/session";
import { getCodexTokens } from "@/lib/codex/session";
import { MAX_RAW_DESCRIPTION } from "@/lib/applications/form";
import { reportError } from "@/lib/monitoring";
import {
  BURST_EXTRACTIONS_PER_MINUTE,
  BURST_WINDOW_MS,
} from "@/lib/extraction/constants";
import { tryRecordExtraction } from "@/lib/extraction/usage";
import {
  EXTRACTION_REQUESTED_EVENT,
  inngest,
} from "@/lib/inngest/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { rawDescription?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const rawDescription = body.rawDescription?.trim();
  if (!rawDescription) {
    return NextResponse.json(
      { error: "missing_description", message: "Paste a job description first." },
      { status: 400 },
    );
  }

  if (rawDescription.length > MAX_RAW_DESCRIPTION) {
    return NextResponse.json(
      {
        error: "description_too_long",
        message: `Job description must be ${MAX_RAW_DESCRIPTION.toLocaleString()} characters or fewer.`,
      },
      { status: 400 },
    );
  }

  const tokens = await getCodexTokens(user.id);
  if (!tokens) {
    return NextResponse.json(
      {
        error: "not_connected",
        message: "Connect ChatGPT in Settings to use AI extraction.",
      },
      { status: 403 },
    );
  }

  try {
    const allowed = await tryRecordExtraction(
      BURST_EXTRACTIONS_PER_MINUTE,
      BURST_WINDOW_MS / 1000,
    );
    if (!allowed) {
      return NextResponse.json(
        {
          error: "rate_limited",
          message: "Too many extractions. Wait a minute and try again.",
        },
        { status: 429 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "extraction_failed", message: "Could not check rate limits." },
      { status: 500 },
    );
  }

  const supabase = await createClient();
  const { data: job, error: insertError } = await supabase
    .from("extraction_jobs")
    .insert({
      user_id: user.id,
      status: "pending",
      raw_description: rawDescription,
    })
    .select("id")
    .single();

  if (insertError || !job) {
    reportError(insertError ?? new Error("missing job row"), {
      route: "api/extract",
      step: "insert_job",
    });
    return NextResponse.json(
      {
        error: "extraction_failed",
        message: "Could not start extraction. Try again.",
      },
      { status: 500 },
    );
  }

  try {
    await inngest.send({
      name: EXTRACTION_REQUESTED_EVENT,
      data: { jobId: job.id, userId: user.id },
    });
  } catch (err) {
    reportError(err, { route: "api/extract", step: "enqueue" });
    try {
      await createAdminClient()
        .from("extraction_jobs")
        .update({
          status: "failed",
          error_code: "extraction_failed",
          error_message: "Could not queue extraction. Try again.",
          completed_at: new Date().toISOString(),
        })
        .eq("id", job.id);
    } catch {
      // Best-effort; job may stay pending until retention cron.
    }

    return NextResponse.json(
      {
        error: "extraction_failed",
        message: "Could not queue extraction. Try again.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ jobId: job.id }, { status: 202 });
}
