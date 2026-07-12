import { randomUUID } from "node:crypto";

import { getUserInfoFromToken, type CodexTokens } from "./auth";
import { codexModel, CODEX_RESPONSES_URL } from "./constants";

function parseSseText(sseBody: string): string {
  const lines = sseBody.split("\n");
  let text = "";
  let currentEvent = "";

  for (const line of lines) {
    if (line.startsWith("event:")) {
      currentEvent = line.slice(6).trim();
      continue;
    }
    if (!line.startsWith("data:")) {
      continue;
    }
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") {
      continue;
    }
    try {
      const json = JSON.parse(data) as {
        delta?: string;
        type?: string;
        response?: { output?: Array<{ content?: Array<{ text?: string }> }> };
      };
      if (currentEvent === "response.output_text.delta" && json.delta) {
        text += json.delta;
      } else if (json.type === "response.output_text.delta" && json.delta) {
        text += json.delta;
      } else if (json.response?.output?.[0]?.content?.[0]?.text) {
        text += json.response.output[0].content[0].text;
      }
    } catch {
      // skip malformed SSE chunks
    }
  }

  return text;
}

export async function sendCodexMessage({
  tokens,
  instructions,
  userText,
}: {
  tokens: CodexTokens;
  instructions: string;
  userText: string;
}): Promise<string> {
  const userInfo = getUserInfoFromToken(tokens.access_token);
  if (!userInfo?.accountId) {
    throw new Error("Could not extract chatgpt_account_id from access token.");
  }

  const body = {
    model: codexModel(),
    instructions,
    input: [
      {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: userText }],
      },
    ],
    store: false,
    stream: true,
  };

  let response: Response;
  try {
    response = await fetch(CODEX_RESPONSES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.access_token}`,
        "chatgpt-account-id": userInfo.accountId,
        "OpenAI-Beta": "responses=experimental",
        originator: "codex_cli_rs",
        session_id: randomUUID(),
        Accept: "text/event-stream",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new Error("Codex request timed out after 30s");
    }
    throw err;
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Codex API failed (${response.status})${text ? `: ${text}` : ""}`,
    );
  }

  const sseBody = await response.text();
  const text = parseSseText(sseBody).trim();
  if (!text) {
    throw new Error("Empty response from Codex API.");
  }

  return text;
}
