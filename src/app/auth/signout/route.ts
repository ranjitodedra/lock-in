import { NextResponse } from "next/server";

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

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return NextResponse.redirect(`${origin}/login`, { status: 303 });
}
