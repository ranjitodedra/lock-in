import { peekBrowserSupabaseConfig } from "@/lib/supabase/browser-config";

export const PROTECTED_PREFIXES = ["/dashboard", "/applications", "/settings", "/admin"];

export const AUTH_ROUTES = ["/login"];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/** Same-origin relative path only — blocks open redirects. */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

function serverAppUrl(): string {
  // Deferred require: this module is imported by client components; keep `@/env`
  // out of the static client graph while still using the validated contract on the server.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { env } = require("@/env") as typeof import("@/env");
  return env.APP_URL;
}

export function appOrigin(): string {
  const injected = peekBrowserSupabaseConfig()?.appUrl;
  if (injected) return injected;

  // Client bundles cannot read non-public env; fall back to the served origin.
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return serverAppUrl();
}

export function authCallbackUrl(): string {
  return `${appOrigin()}/auth/callback`;
}
