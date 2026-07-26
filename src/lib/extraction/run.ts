import { ensureFreshTokens, type CodexTokens } from "@/lib/codex/auth";
import { sendCodexMessage } from "@/lib/codex/client";
import {
  EXTRACTION_SYSTEM_PROMPT,
  extractionUserMessage,
} from "@/lib/extraction/prompt";
import { parseExtractionResponse } from "@/lib/extraction/schema";
import { reportError } from "@/lib/monitoring";
import { createAdminClient } from "@/lib/supabase/admin";
import type { JobExtraction } from "@/types/application";

export type ExtractionRunOk = { ok: true; data: JobExtraction };
export type ExtractionRunErr = {
  ok: false;
  error: string;
  message: string;
};
export type ExtractionRunResult = ExtractionRunOk | ExtractionRunErr;

function rowToTokens(row: {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}): CodexTokens {
  return {
    access_token: row.access_token,
    refresh_token: row.refresh_token,
    id_token: null,
    expires_at: new Date(row.expires_at).getTime(),
  };
}

async function loadTokens(userId: string): Promise<CodexTokens | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("codex_connections")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return rowToTokens(data);
}

async function persistTokens(userId: string, tokens: CodexTokens): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("codex_connections").upsert({
    user_id: userId,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: new Date(tokens.expires_at).toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (error) {
    throw new Error(`Failed to save Codex connection: ${error.message}`);
  }
}

/** Runs Codex extraction for a user. Uses service-role for token I/O (worker-safe). */
export async function runExtraction(params: {
  userId: string;
  rawDescription: string;
}): Promise<ExtractionRunResult> {
  const { userId, rawDescription } = params;

  let tokens = await loadTokens(userId);
  if (!tokens) {
    return {
      ok: false,
      error: "not_connected",
      message: "Connect ChatGPT in Settings to use AI extraction.",
    };
  }

  const originalAccessToken = tokens.access_token;
  try {
    const fresh = await ensureFreshTokens(tokens);
    if (!fresh) {
      return {
        ok: false,
        error: "not_connected",
        message: "ChatGPT session expired. Reconnect in Settings.",
      };
    }
    tokens = fresh;
    if (fresh.access_token !== originalAccessToken) {
      await persistTokens(userId, fresh);
    }
  } catch (err) {
    reportError(err, { route: "extraction/run", step: "codex_refresh" });
    return {
      ok: false,
      error: "not_connected",
      message: "ChatGPT session expired. Reconnect in Settings.",
    };
  }

  let content: string;
  try {
    content = await sendCodexMessage({
      tokens,
      instructions: EXTRACTION_SYSTEM_PROMPT,
      userText: extractionUserMessage(rawDescription),
    });
  } catch (err) {
    reportError(err, { route: "extraction/run", step: "codex_completion" });
    const subscription =
      err instanceof Error && /subscription|plus|plan|401|403/i.test(err.message);
    return {
      ok: false,
      error: subscription ? "subscription_error" : "extraction_failed",
      message: subscription
        ? "Your ChatGPT subscription may not support this feature."
        : "Extraction failed. Try again or fill in fields manually.",
    };
  }

  if (!content) {
    return {
      ok: false,
      error: "extraction_failed",
      message: "No extraction result returned. Try again.",
    };
  }

  const parsed = parseExtractionResponse(content);
  if (!parsed.ok) {
    if ("notJobPosting" in parsed && parsed.notJobPosting) {
      return {
        ok: false,
        error: parsed.notJobPosting.error,
        message: parsed.notJobPosting.message,
      };
    }
    return {
      ok: false,
      error: "extraction_failed",
      message: "Could not parse extraction result. Try again.",
    };
  }

  return { ok: true, data: parsed.data };
}
