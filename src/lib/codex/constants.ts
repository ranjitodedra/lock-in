export const CODEX_PENDING_COOKIE = "lock_in_codex_pending";

export const AUTH_BASE = "https://auth.openai.com";
export const DEVICE_VERIFICATION_URI = `${AUTH_BASE}/codex/device`;
export const CODEX_RESPONSES_URL =
  "https://chatgpt.com/backend-api/codex/responses";
export const JWT_CLAIM_PATH = "https://api.openai.com/auth";

export function codexClientId(): string {
  return process.env.CODEX_CLIENT_ID ?? "app_EMoamEEZ73f0CkXaXp7hrann";
}

export function codexModel(): string {
  return process.env.CODEX_MODEL ?? "gpt-5.5";
}
