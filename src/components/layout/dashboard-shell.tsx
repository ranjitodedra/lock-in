import type { User } from "@supabase/supabase-js";

import { EmailVerificationBanner } from "@/components/auth/email-verification-banner";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { isAdmin } from "@/lib/auth/admin-check";

type DashboardShellProps = {
  title: string;
  description?: string;
  showNewAction?: boolean;
  hideTitle?: boolean;
  user: User;
  children: React.ReactNode;
};

export function DashboardShell({
  title,
  description,
  showNewAction,
  hideTitle,
  user,
  children,
}: DashboardShellProps) {
  const showAdminNav = isAdmin(user);

  return (
    <div className="flex h-dvh overflow-hidden bg-[#f2f2f2] dark:bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <AppSidebar user={user} showAdminNav={showAdminNav} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <EmailVerificationBanner user={user} />
        <AppHeader
          title={title}
          description={description}
          showNewAction={showNewAction}
          hideTitle={hideTitle}
          user={user}
          showAdminNav={showAdminNav}
        />
        <main
          id="main-content"
          className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 md:p-6"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
