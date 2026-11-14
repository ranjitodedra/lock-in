import { describe, expect, it } from "vitest";

import { loadEnv } from "@/env";

describe("env contract", () => {
  it("accepts Secret-compatible names", () => {
    const result = loadEnv({
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_ANON_KEY: "ci-placeholder-anon-key",
      APP_URL: "https://app.example.com",
      SENTRY_DSN: "https://example@sentry.io/123",
    });

    expect(result.SUPABASE_URL).toBe("https://example.supabase.co");
    expect(result.SUPABASE_ANON_KEY).toBe("ci-placeholder-anon-key");
    expect(result.APP_URL).toBe("https://app.example.com");
    expect(result.SENTRY_DSN).toBe("https://example@sentry.io/123");
  });

  it("fails closed when required names are missing", () => {
    expect(() => loadEnv({})).toThrow(/SUPABASE_URL/);
  });
});
