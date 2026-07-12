import { codexClientId, DEVICE_VERIFICATION_URI, JWT_CLAIM_PATH } from "./constants";

const DEVICE_USER_CODE_URL = "https://auth.openai.com/api/accounts/deviceauth/usercode";
const DEVICE_TOKEN_URL = "https://auth.openai.com/api/accounts/deviceauth/token";
const DEVICE_REDIRECT_URI = "https://auth.openai.com/deviceauth/callback";
const TOKEN_URL = "https://auth.openai.com/oauth/token";
const DEVICE_TIMEOUT_MS = 15 * 60 * 1000;

export type CodexTokens = {
  access_token: string;
  refresh_token: string;
  id_token: string | null;
  expires_at: number;
  mock?: boolean;
};

export type DeviceAuthState = {
  mock?: boolean;
  user_code: string;
  verification_uri: string;
  interval: number;
  device_auth_id: string;
  started_at: number;
};

export type PollResult =
  | { status: "pending" }
  | { status: "complete"; tokens: CodexTokens }
  | { status: "error"; message: string };

function parseInterval(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 5;
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }
  const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  try {
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
}

export function getUserInfoFromToken(accessToken: string) {
  const payload = decodeJwtPayload(accessToken);
  const auth = payload?.[JWT_CLAIM_PATH] as Record<string, unknown> | undefined;
  if (!auth) {
    return null;
  }
  return {
    email: (auth.email as string | undefined) ?? (payload?.email as string | undefined) ?? null,
    accountId: (auth.chatgpt_account_id as string | undefined) ?? null,
    planType: (auth.chatgpt_plan_type as string | undefined) ?? null,
  };
}

export async function startDeviceAuth(): Promise<DeviceAuthState> {
  const response = await fetch(DEVICE_USER_CODE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: codexClientId() }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    if (response.status === 404) {
      throw new Error("Device code login is not enabled for this account.");
    }
    throw new Error(
      `Device code request failed (${response.status})${body ? `: ${body}` : ""}`,
    );
  }

  const json = (await response.json()) as {
    device_auth_id?: string;
    user_code?: string;
    interval?: number | string;
  };
  const interval = parseInterval(json.interval);
  if (!json.device_auth_id || !json.user_code) {
    throw new Error(`Invalid device code response: ${JSON.stringify(json)}`);
  }

  return {
    user_code: json.user_code,
    verification_uri: DEVICE_VERIFICATION_URI,
    interval,
    device_auth_id: json.device_auth_id,
    started_at: Date.now(),
  };
}

async function exchangeAuthorizationCode(
  authorizationCode: string,
  codeVerifier: string,
): Promise<CodexTokens> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: codexClientId(),
    code: authorizationCode,
    code_verifier: codeVerifier,
    redirect_uri: DEVICE_REDIRECT_URI,
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Token exchange failed (${response.status})${text ? `: ${text}` : ""}`,
    );
  }

  const json = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    id_token?: string;
    expires_in?: number;
  };
  if (!json.access_token || !json.refresh_token) {
    throw new Error(`Token exchange missing fields: ${JSON.stringify(json)}`);
  }

  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    id_token: json.id_token ?? null,
    expires_at:
      Date.now() + (typeof json.expires_in === "number" ? json.expires_in : 3600) * 1000,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<CodexTokens> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: codexClientId(),
    refresh_token: refreshToken,
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Token refresh failed (${response.status})${text ? `: ${text}` : ""}`,
    );
  }

  const json = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    id_token?: string;
    expires_in?: number;
  };
  if (!json.access_token || !json.refresh_token) {
    throw new Error(`Refresh response missing fields: ${JSON.stringify(json)}`);
  }

  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    id_token: json.id_token ?? null,
    expires_at:
      Date.now() + (typeof json.expires_in === "number" ? json.expires_in : 3600) * 1000,
  };
}

export async function pollDeviceAuth(deviceAuth: DeviceAuthState): Promise<PollResult> {
  if (Date.now() - deviceAuth.started_at > DEVICE_TIMEOUT_MS) {
    return { status: "error", message: "Device code expired (15 minutes)." };
  }

  const response = await fetch(DEVICE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      device_auth_id: deviceAuth.device_auth_id,
      user_code: deviceAuth.user_code,
    }),
  });

  if (response.status === 403 || response.status === 404) {
    return { status: "pending" };
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    let errorCode: unknown;
    try {
      const json = JSON.parse(body) as { error?: string | { code?: string } };
      const err = json?.error;
      errorCode = typeof err === "object" ? err?.code : err;
    } catch {
      // ignore
    }
    if (
      errorCode === "deviceauth_authorization_pending" ||
      errorCode === "slow_down"
    ) {
      return { status: "pending" };
    }
    return {
      status: "error",
      message: `Device auth failed (${response.status})${body ? `: ${body}` : ""}`,
    };
  }

  const json = (await response.json()) as {
    authorization_code?: string;
    code_verifier?: string;
  };
  if (!json.authorization_code || !json.code_verifier) {
    return {
      status: "error",
      message: `Invalid token poll response: ${JSON.stringify(json)}`,
    };
  }

  try {
    const tokens = await exchangeAuthorizationCode(
      json.authorization_code,
      json.code_verifier,
    );
    return { status: "complete", tokens };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function ensureFreshTokens(
  tokens: CodexTokens | null,
): Promise<CodexTokens | null> {
  if (!tokens) {
    return null;
  }
  const bufferMs = 60 * 1000;
  if (tokens.expires_at - Date.now() > bufferMs) {
    return tokens;
  }
  return refreshAccessToken(tokens.refresh_token);
}
