import { createBrowserClient } from "@supabase/ssr";

import { getBrowserSupabaseConfig } from "@/lib/supabase/browser-config";
import type { Database } from "@/types/database";

export function createClient() {
  const { url, anonKey } = getBrowserSupabaseConfig();
  return createBrowserClient<Database>(url, anonKey);
}
