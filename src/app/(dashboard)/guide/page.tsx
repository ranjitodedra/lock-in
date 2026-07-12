import { AppGuideContent } from "@/components/guide/app-guide-content";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireUser } from "@/lib/auth/session";

export default async function GuidePage() {
  const user = await requireUser();

  return (
    <DashboardShell
      title="Guide"
      description="How to use Lock-In — from connecting ChatGPT to tracking applications."
      showNewAction={false}
      user={user}
    >
      <AppGuideContent />
    </DashboardShell>
  );
}
