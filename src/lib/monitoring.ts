import { peekBrowserSupabaseConfig } from "@/lib/supabase/browser-config";

type ErrorContext = Record<string, string>;

function sentryEnvelopeUrl(dsn: string): string | null {
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.replace(/^\//, "");
    if (!projectId) return null;
    return `https://${url.host}/api/${projectId}/envelope/`;
  } catch {
    return null;
  }
}

function resolveSentryDsn(): string | undefined {
  const injected = peekBrowserSupabaseConfig()?.sentryDsn;
  if (injected) return injected;

  if (typeof window !== "undefined") {
    // Client has no non-public env; DSN only via layout injection.
    return undefined;
  }

  // Server: validated env contract (deferred require keeps this module client-safe).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { env } = require("@/env") as typeof import("@/env");
  return env.SENTRY_DSN;
}

/** ponytail: no-op without DSN; swap for @sentry/nextjs later without changing call sites */
export function reportError(error: unknown, context?: ErrorContext): void {
  const message = error instanceof Error ? error.message : String(error);
  const dsn = resolveSentryDsn();

  if (process.env.NODE_ENV === "development") {
    console.error("[reportError]", message, context ?? {});
  }

  if (!dsn) return;

  const envelopeUrl = sentryEnvelopeUrl(dsn);
  if (!envelopeUrl) return;

  const eventId = crypto.randomUUID().replace(/-/g, "");
  const payload = {
    event_id: eventId,
    level: "error",
    platform: "javascript",
    timestamp: Date.now() / 1000,
    message,
    extra: context ?? {},
  };

  const envelope = [
    JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString() }),
    JSON.stringify({ type: "event" }),
    JSON.stringify(payload),
  ].join("\n");

  void fetch(envelopeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-sentry-envelope",
      "X-Sentry-Auth": `Sentry sentry_version=7, sentry_client=lock-in/1.0, sentry_key=${new URL(dsn).username}`,
    },
    body: envelope,
  }).catch(() => {
    // ponytail: monitoring must not break user flows
  });
}
