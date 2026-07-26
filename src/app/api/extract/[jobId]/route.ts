import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth/session";
import { jobToPollResponse } from "@/lib/extraction/job-status";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ jobId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await context.params;
  if (!jobId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = await createClient();
  const { data: job, error } = await supabase
    .from("extraction_jobs")
    .select("status, result, error_code, error_message, user_id")
    .eq("id", jobId)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "extraction_failed", message: "Could not load extraction job." },
      { status: 500 },
    );
  }

  if (!job || job.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(jobToPollResponse(job));
}
