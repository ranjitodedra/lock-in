"use client";

import type { User } from "@supabase/supabase-js";

import { AppLogo } from "@/components/brand/app-logo";
import { NavLinks } from "@/components/layout/nav-links";

type AppSidebarProps = {
  user: User;
  showAdminNav?: boolean;
};

export function AppSidebar({ user, showAdminNav = false }: AppSidebarProps) {
  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col bg-card md:flex">
      <div className="flex items-center gap-2 px-5 py-6">
        <AppLogo width={32} height={32} />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold tracking-tight">
            Lock-In Tracker
          </span>
          <span className="truncate text-xs text-muted-foreground">
            Job tracker
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-4">
        <NavLinks user={user} showAdminNav={showAdminNav} />
      </div>
    </aside>
  );
}
