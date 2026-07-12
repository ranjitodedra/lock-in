import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth/session";
import { sendCodexMessage } from "@/lib/codex/client";
import { ensureFreshTokens } from "@/lib/codex/auth";
import {
  getCodexTokens,
  saveCodexTokens,
} from "@/lib/codex/session";
import { MAX_RAW_DESCRIPTION } from "@/lib/applications/form";
import { reportError } from "@/lib/monitoring";
import {
  BURST_EXTRACTIONS_PER_MINUTE,
  BURST_WINDOW_MS,
} from "@/lib/extraction/constants";
import {
  EXTRACTION_SYSTEM_PROMPT,
  extractionUserMessage,
} from "@/lib/extraction/prompt";
import { parseExtractionResponse } from "@/lib/extraction/schema";
import { tryRecordExtraction } from "@/lib/extraction/usage";

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

  let tokens = await getCodexTokens(user.id);
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

  const originalAccessToken = tokens.access_token;
  try {
    const fresh = await ensureFreshTokens(tokens);
    if (!fresh) {
      return NextResponse.json(
        {
          error: "not_connected",
          message: "ChatGPT session expired. Reconnect in Settings.",
        },
        { status: 403 },
      );
    }
    tokens = fresh;
    if (fresh.access_token !== originalAccessToken) {
      await saveCodexTokens(user.id, fresh);
    }
  } catch (err) {
    reportError(err, { route: "api/extract", step: "codex_refresh" });
    return NextResponse.json(
      {
        error: "not_connected",
        message: "ChatGPT session expired. Reconnect in Settings.",
      },
      { status: 403 },
    );
  }

  let content: string;
  try {
    content = await sendCodexMessage({
      tokens,
      instructions: EXTRACTION_SYSTEM_PROMPT,
      userText: extractionUserMessage(rawDescription),
    });
  } catch (err) {
    reportError(err, { route: "api/extract", step: "codex_completion" });
    const message =
      err instanceof Error && /subscription|plus|plan|401|403/i.test(err.message)
        ? "Your ChatGPT subscription may not support this feature."
        : "Extraction failed. Try again or fill in fields manually.";
    const code =
      err instanceof Error && /subscription|plus|plan|401|403/i.test(err.message)
        ? "subscription_error"
        : "extraction_failed";
    return NextResponse.json(
      { error: code, message },
      { status: code === "subscription_error" ? 402 : 500 },
    );
  }

  if (!content) {
    return NextResponse.json(
      {
        error: "extraction_failed",
        message: "No extraction result returned. Try again.",
      },
      { status: 500 },
    );
  }

  const parsed = parseExtractionResponse(content);
  if (!parsed.ok) {
    if ("notJobPosting" in parsed && parsed.notJobPosting) {
      return NextResponse.json(parsed.notJobPosting, { status: 422 });
    }
    return NextResponse.json(
      {
        error: "extraction_failed",
        message: "Could not parse extraction result. Try again.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: parsed.data });
}
