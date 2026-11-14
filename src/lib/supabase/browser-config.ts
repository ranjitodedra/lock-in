export type BrowserSupabaseConfig = {
  url: string;
  anonKey: string;
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

export function clearBrowserSupabaseConfig() {
  config = null;
}
