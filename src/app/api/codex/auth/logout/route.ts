import { NextResponse } from "next/server";

import { clearCodexConnection } from "@/lib/codex/session";
import { getAuthUser } from "@/lib/auth/session";

export async function POST() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  await clearCodexConnection(user.id, response);
  return response;
}
