import { ApplicationsDashboard } from "@/components/dashboard/applications-dashboard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { listApplicationsPage } from "@/lib/applications/queries";
import { requireUser } from "@/lib/auth/session";

export default async function DashboardPage() {
  const user = await requireUser();
  const { items, nextCursor, totalCount } = await listApplicationsPage();

  return (
    <DashboardShell
      title="Dashboard"
      description="Track every application in one place."
      showNewAction={false}
      hideTitle
      user={user}
    >
      <ApplicationsDashboard
        applications={items}
        initialNextCursor={nextCursor}
        totalCount={totalCount}
      />
    </DashboardShell>
  );
}
