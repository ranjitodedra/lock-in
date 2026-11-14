export type BrowserSupabaseConfig = {
  url: string;
  anonKey: string;
  /** Canonical app origin for auth redirects when set (from APP_URL). */
  appUrl?: string;
  /** Optional Sentry DSN for client-side reportError. */
  sentryDsn?: string;
};

let config: BrowserSupabaseConfig | null = null;

export function setBrowserSupabaseConfig(next: BrowserSupabaseConfig) {
  config = next;
}

export function getBrowserSupabaseConfig(): BrowserSupabaseConfig {
  if (!config) {
    throw new Error(
      "Browser Supabase config is not set. Mount SupabaseBrowserProvider from the root layout.",
    );
  }
  return config;
}

/** Non-throwing read for optional fields (app URL / DSN) before/without full config. */
export function peekBrowserSupabaseConfig(): BrowserSupabaseConfig | null {
  return config;
}

export function clearBrowserSupabaseConfig() {
  config = null;
}
