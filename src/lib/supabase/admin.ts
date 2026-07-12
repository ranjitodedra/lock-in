import { createClient } from "@supabase/supabase-js";

import { env } from "@/env";
import type { Database } from "@/types/database";

export function isAdminClientConfigured(): boolean {
  return Boolean(env.SUPABASE_SERVICE_ROLE_KEY);
}

export function createAdminClient() {
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY for admin client.",
    );
  }

  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
