import { NextResponse } from "next/server";

import { startDeviceAuth } from "@/lib/codex/auth";
import { setPendingDeviceAuth } from "@/lib/codex/session";
import { getAuthUser } from "@/lib/auth/session";

export async function POST() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deviceAuth = await startDeviceAuth();
    const response = NextResponse.json({
      user_code: deviceAuth.user_code,
      verification_uri: deviceAuth.verification_uri,
      interval: deviceAuth.interval,
    });
    setPendingDeviceAuth(response, deviceAuth);
    return response;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to start auth" },
      { status: 500 },
    );
  }
}
