import { NextResponse } from "next/server";

import { env } from "@/env";
import { clearCodexConnection } from "@/lib/codex/session";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await clearCodexConnection(user.id);
  }

  await supabase.auth.signOut();

  return NextResponse.redirect(`${env.APP_URL}/login`, { status: 303 });
}
