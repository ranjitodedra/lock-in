import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ChatGptConnectionCard } from "@/components/settings/chatgpt-connection-card";
import { getChatGptConnection } from "@/lib/codex/session";
import { requireUser } from "@/lib/auth/session";

export default async function SettingsPage() {
  const user = await requireUser();
  const connection = await getChatGptConnection();

  return (
    <DashboardShell
      title="Settings"
      description="Account and ChatGPT connection."
      showNewAction={false}
      user={user}
    >
      <div className="flex-1 space-y-6 overflow-auto">
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-medium">Account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Signed in as {user.email ?? "unknown"}
            {user.email_confirmed_at ? " · verified" : " · email not verified"}
          </p>
        </section>

        <ChatGptConnectionCard initialConnection={connection} />
      </div>
    </DashboardShell>
  );
}
