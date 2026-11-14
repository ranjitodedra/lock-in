import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import { SupabaseBrowserProvider } from "@/components/auth/supabase-browser-provider";
import { authCallbackUrl } from "@/lib/auth/routes";
import { reportError } from "@/lib/monitoring";
import {
  clearBrowserSupabaseConfig,
  peekBrowserSupabaseConfig,
} from "@/lib/supabase/browser-config";
import { createClient } from "@/lib/supabase/client";

describe("browser config injection seams", () => {
  afterEach(() => {
    clearBrowserSupabaseConfig();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("provider enables createClient for auth call sites", () => {
    render(
      <SupabaseBrowserProvider
        url="https://injected.supabase.co"
        anonKey="injected-anon-key"
      >
        <span>child</span>
      </SupabaseBrowserProvider>,
    );

    expect(() => createClient()).not.toThrow();
    expect(peekBrowserSupabaseConfig()?.url).toBe("https://injected.supabase.co");
  });

  it("authCallbackUrl prefers injected APP_URL over window origin", () => {
    render(
      <SupabaseBrowserProvider
        url="https://injected.supabase.co"
        anonKey="injected-anon-key"
        appUrl="https://app.example.com"
      >
        <span>child</span>
      </SupabaseBrowserProvider>,
    );

    expect(authCallbackUrl()).toBe("https://app.example.com/auth/callback");
  });

  it("reportError can use injected Sentry DSN on the client", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <SupabaseBrowserProvider
        url="https://injected.supabase.co"
        anonKey="injected-anon-key"
        sentryDsn="https://key@sentry.example/1"
      >
        <span>child</span>
      </SupabaseBrowserProvider>,
    );

    reportError(new Error("boom"), { digest: "abc" });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://sentry.example/api/1/envelope/",
    );
  });
});
