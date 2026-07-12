/**
 * Verify Google OAuth no longer returns redirect_uri_mismatch.
 * Follows Supabase -> Google redirect and checks for Google error page.
 */
import { getSupabaseProjectRef, loadEnvLocal } from "./load-env-local.mjs";

const env = { ...process.env, ...loadEnvLocal() };
const projectRef = getSupabaseProjectRef(env);
const appUrl = env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
const redirectTo = encodeURIComponent(`${appUrl}/auth/callback`);
const authorizeUrl = `https://${projectRef}.supabase.co/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`;

const supabaseRes = await fetch(authorizeUrl, { redirect: "manual" });
const googleUrl = supabaseRes.headers.get("location") ?? "";

if (!googleUrl.includes("accounts.google.com")) {
  console.error("FAIL: expected Google authorize URL, got", googleUrl.slice(0, 120));
  process.exit(1);
}

const googleRes = await fetch(googleUrl, { redirect: "manual" });
const next = googleRes.headers.get("location") ?? "";
const body = await googleRes.text();

if (
  next.includes("redirect_uri_mismatch") ||
  body.includes("redirect_uri_mismatch") ||
  next.includes("/oauth/error")
) {
  console.error("FAIL: redirect_uri_mismatch");
  process.exit(1);
}

if (
  googleRes.status === 200 ||
  next.includes("accounts.google.com/signin") ||
  next.includes("accounts.google.com/v3/signin")
) {
  console.log("OK: Google accepted redirect URI (account picker / sign-in reachable)");
  process.exit(0);
}

console.error("FAIL: unexpected Google response", googleRes.status, next.slice(0, 120));
process.exit(1);
