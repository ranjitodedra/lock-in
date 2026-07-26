import { NextResponse } from "next/server";

import { env } from "@/env";
import { createAdminClient } from "@/lib/supabase/admin";

const RETENTION_MS = 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!env.CRON_SECRET || authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - RETENTION_MS).toISOString();
  const supabase = createAdminClient();

  const [usage, jobs] = await Promise.all([
    supabase
      .from("extraction_usage")
      .delete({ count: "exact" })
      .lt("created_at", cutoff),
    supabase
      .from("extraction_jobs")
      .delete({ count: "exact" })
      .lt("created_at", cutoff),
  ]);

  if (usage.error) {
    return NextResponse.json({ error: usage.error.message }, { status: 500 });
  }
  if (jobs.error) {
    return NextResponse.json({ error: jobs.error.message }, { status: 500 });
  }

  return NextResponse.json({
    deleted: usage.count ?? 0,
    deletedJobs: jobs.count ?? 0,
  });
}
