import { notFound } from "next/navigation";

import { ApplicationDetailPage } from "@/components/applications/application-detail-page";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { rowToFormValues } from "@/lib/applications/form";
import { getApplication } from "@/lib/applications/queries";
import { getChatGptConnection } from "@/lib/codex/session";
import { requireUser } from "@/lib/auth/session";

type ApplicationDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function ApplicationDetailRoute({
  params,
}: ApplicationDetailRouteProps) {
  const user = await requireUser();
  const { id } = await params;
  const [application, connection] = await Promise.all([
    getApplication(id),
    getChatGptConnection(),
  ]);

  if (!application) {
    notFound();
  }

  const shellTitle =
    [application.company, application.job_title].filter(Boolean).join(" · ") ||
    "Application";

  return (
    <DashboardShell
      title={shellTitle}
      showNewAction={false}
      user={user}
    >
      <ApplicationDetailPage
        application={application}
        formValues={rowToFormValues(application)}
        emailVerified={!!user.email_confirmed_at}
        chatGptConnected={connection.connected}
      />
    </DashboardShell>
  );
}
