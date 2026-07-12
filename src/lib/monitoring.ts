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

/** ponytail: no-op without DSN; swap for @sentry/nextjs later without changing call sites */
export function reportError(error: unknown, context?: ErrorContext): void {
  const message = error instanceof Error ? error.message : String(error);
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

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
