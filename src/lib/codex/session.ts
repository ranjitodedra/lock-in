import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

import {
  ensureFreshTokens,
  getUserInfoFromToken,
  type CodexTokens,
  type DeviceAuthState,
} from "./auth";
import { CODEX_PENDING_COOKIE } from "./constants";

export type ChatGptConnection = {
  connected: boolean;
  email?: string | null;
  planType?: string | null;
  expiresAt?: number;
};

export function cookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

function parseJsonCookie<T>(value: string | undefined): T | null {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

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

export async function getPendingDeviceAuth(): Promise<DeviceAuthState | null> {
  const cookieStore = await cookies();
  return parseJsonCookie<DeviceAuthState>(
    cookieStore.get(CODEX_PENDING_COOKIE)?.value,
  );
}

export async function getCodexTokens(userId: string): Promise<CodexTokens | null> {
  const supabase = await createClient();
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

export async function getFreshCodexTokens(
  userId: string,
): Promise<CodexTokens | null> {
  const tokens = await getCodexTokens(userId);
  if (!tokens) {
    return null;
  }
  const fresh = await ensureFreshTokens(tokens);
  if (fresh && fresh.access_token !== tokens.access_token) {
    await saveCodexTokens(userId, fresh);
  }
  return fresh;
}

export async function getChatGptConnection(): Promise<ChatGptConnection> {
  const user = await getAuthUser();
  if (!user) {
    return { connected: false };
  }

  const tokens = await getCodexTokens(user.id);
  if (!tokens?.access_token) {
    return { connected: false };
  }

  const info = getUserInfoFromToken(tokens.access_token);
  if (!info) {
    return { connected: false };
  }

  return {
    connected: true,
    email: info.email,
    planType: info.planType,
    expiresAt: Math.floor(tokens.expires_at / 1000),
  };
}

export function setPendingDeviceAuth(
  response: NextResponse,
  pending: DeviceAuthState,
) {
  response.cookies.set(
    CODEX_PENDING_COOKIE,
    JSON.stringify(pending),
    cookieOptions(15 * 60),
  );
}

export async function saveCodexTokens(
  userId: string,
  tokens: CodexTokens,
): Promise<void> {
  const supabase = await createClient();
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

export async function setCodexSession(
  userId: string,
  tokens: CodexTokens,
  response: NextResponse,
) {
  await saveCodexTokens(userId, tokens);
  response.cookies.set(CODEX_PENDING_COOKIE, "", cookieOptions(0));
}

export async function clearCodexConnection(
  userId: string,
  response?: NextResponse,
) {
  const supabase = await createClient();
  await supabase.from("codex_connections").delete().eq("user_id", userId);

  if (response) {
    response.cookies.set(CODEX_PENDING_COOKIE, "", cookieOptions(0));
  }
}
