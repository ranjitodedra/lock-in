import { createAdminClient } from "@/lib/supabase/admin";

export type AdminUserRow = {
  id: string;
  email: string | null;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  providers: string[];
};

export async function listAllUsers(): Promise<AdminUserRow[]> {
  const supabase = createAdminClient();
  const users: AdminUserRow[] = [];
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw error;
    }

    for (const user of data.users) {
      users.push({
        id: user.id,
        email: user.email ?? null,
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at ?? null,
        last_sign_in_at: user.last_sign_in_at ?? null,
        providers: [
          ...new Set(
            (user.identities ?? [])
              .map((identity) => identity.provider)
              .filter(Boolean),
          ),
        ],
      });
    }

    if (data.users.length < perPage) {
      break;
    }

    page += 1;
  }

  return users;
}
