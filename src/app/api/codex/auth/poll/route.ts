import { NextResponse } from "next/server";

import { pollDeviceAuth } from "@/lib/codex/auth";
import { getPendingDeviceAuth, setCodexSession } from "@/lib/codex/session";
import { getAuthUser } from "@/lib/auth/session";

export async function POST() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deviceAuth = await getPendingDeviceAuth();
  if (!deviceAuth) {
    return NextResponse.json(
      {
        status: "error",
        message: "No device auth in progress. Connect ChatGPT again.",
      },
      { status: 400 },
    );
  }

  const result = await pollDeviceAuth(deviceAuth);
  if (result.status === "complete") {
    const response = NextResponse.json({ status: "complete" });
    try {
      await setCodexSession(user.id, result.tokens, response);
    } catch (err) {
      return NextResponse.json(
        {
          status: "error",
          message:
            err instanceof Error ? err.message : "Failed to save connection",
        },
        { status: 500 },
      );
    }
    return response;
  }

  return NextResponse.json(result);
}
