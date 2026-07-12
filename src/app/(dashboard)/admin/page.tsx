import { DashboardShell } from "@/components/layout/dashboard-shell";
import { UsersTable } from "@/components/admin/users-table";
import { requireAdmin } from "@/lib/auth/admin";
import { listAllUsers } from "@/lib/admin/queries";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

export default async function AdminPage() {
  const user = await requireAdmin();
  const configured = isAdminClientConfigured();

  if (!configured) {
    return (
      <DashboardShell
        title="Admin"
        description="User accounts overview."
        showNewAction={false}
        user={user}
      >
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-medium">Admin setup required</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add <code className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
            to <code className="font-mono text-xs">.env.local</code> using the
            service role secret from Supabase Dashboard → Project Settings → API,
            then restart the dev server.
          </p>
        </section>
      </DashboardShell>
    );
  }

  const users = await listAllUsers();

  return (
    <DashboardShell
      title="Admin"
      description="User accounts overview."
      showNewAction={false}
      user={user}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-auto">
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-medium">Total users</h2>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {users.length}
          </p>
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-sm font-medium">All users</h2>
          </div>
          <div className="overflow-x-auto">
            <UsersTable users={users} />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
