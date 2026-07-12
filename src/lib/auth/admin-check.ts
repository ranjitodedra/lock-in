import type { User } from "@supabase/supabase-js";

import { env } from "@/env";

export function isAdmin(user: Pick<User, "email">): boolean {
  if (!env.ADMIN_EMAIL || !user.email) {
    return false;
  }
  return user.email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase();
}
