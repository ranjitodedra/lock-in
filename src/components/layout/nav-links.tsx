"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ADMIN_NAV_ITEM, NAV_ITEMS } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

type NavLinksProps = {
  user: User;
  showAdminNav?: boolean;
  onNavigate?: () => void;
  className?: string;
};

export function NavLinks({ user, showAdminNav = false, onNavigate, className }: NavLinksProps) {
  const pathname = usePathname();
  const navItems = showAdminNav ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;

  return (
    <div className={cn("flex flex-1 flex-col", className)}>
      <nav className="flex flex-col gap-1" aria-label="Main navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand text-brand-foreground shadow-sm"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto" />

      <Separator className="my-3" />

      <div className="px-3">
        <p className="truncate text-sm font-medium">
          {user.email ?? "Signed in"}
        </p>
      </div>
      <form action="/auth/signout" method="post" className="mt-3 px-3">
        <Button type="submit" variant="ghost" size="sm" className="w-full">
          <LogOut data-icon="inline-start" />
          Sign out
        </Button>
      </form>
    </div>
  );
}
