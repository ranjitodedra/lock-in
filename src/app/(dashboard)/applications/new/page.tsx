import { ApplicationForm } from "@/components/applications/application-form";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { emptyFormValues } from "@/lib/applications/form";
import { getChatGptConnection } from "@/lib/codex/session";
import { requireUser } from "@/lib/auth/session";

export default async function NewApplicationPage() {
  const user = await requireUser();
  const connection = await getChatGptConnection();

  return (
    <DashboardShell
      title="New Application"
      description="Paste a job description or fill in fields manually."
      showNewAction={false}
      user={user}
    >
      <div className="flex-1 overflow-auto">
        <ApplicationForm
          mode="create"
          initialValues={emptyFormValues()}
          emailVerified={!!user.email_confirmed_at}
          chatGptConnected={connection.connected}
        />
      </div>
    </DashboardShell>
  );
}
