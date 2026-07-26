"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { Menu, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

import { fadeUp, motionTransition } from "@/components/motion/motion-presets";
import { NavLinks } from "@/components/layout/nav-links";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type AppHeaderProps = {
  title: string;
  description?: string;
  showNewAction?: boolean;
  hideTitle?: boolean;
  user?: User;
  showAdminNav?: boolean;
};

function userInitial(user: User): string {
  const name = user.email?.trim();
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
}

export function AppHeader({
  title,
  description,
  showNewAction = true,
  hideTitle = false,
  user,
  showAdminNav = false,
}: AppHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const transition = motionTransition(reducedMotion, 0.3);

  return (
    <header className="flex min-h-14 shrink-0 items-center justify-between gap-3 bg-transparent px-4 py-3 md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        {user ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-4" />
            </Button>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetContent side="left" className="flex w-72 flex-col bg-card p-0">
                <SheetHeader className="border-b border-border p-4">
                  <SheetTitle>Lock-In</SheetTitle>
                </SheetHeader>
                <div className="flex min-h-0 flex-1 flex-col p-3">
                  <NavLinks
                    user={user}
                    showAdminNav={showAdminNav}
                    onNavigate={() => setMobileOpen(false)}
                    className="min-h-0 flex-1"
                  />
                </div>
              </SheetContent>
            </Sheet>
          </>
        ) : null}
        {!hideTitle ? (
          <motion.div
            className="min-w-0"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={transition}
          >
            <h1 className="truncate text-lg font-semibold tracking-tight">
              {title}
            </h1>
            {description ? (
              <p className="truncate text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </motion.div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {user ? (
          <div
            className="hidden items-center gap-2 rounded-full border border-border bg-card px-2 py-1 sm:flex"
            aria-label={`Signed in as ${user.email ?? "user"}`}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-medium text-brand-foreground">
              {userInitial(user)}
            </span>
            <span className="max-w-[140px] truncate text-sm text-muted-foreground">
              {user.email ?? "Signed in"}
            </span>
          </div>
        ) : null}
        <ThemeToggle />
        {showNewAction ? (
          <Button
            variant="brand"
            render={<Link href="/applications/new" />}
            nativeButton={false}
            className="hidden sm:inline-flex"
          >
            <PlusCircle data-icon="inline-start" />
            New Application
          </Button>
        ) : null}
        {showNewAction ? (
          <Button
            variant="brand"
            render={<Link href="/applications/new" />}
            nativeButton={false}
            size="icon"
            className="sm:hidden"
            aria-label="New application"
          >
            <PlusCircle className="size-4" />
          </Button>
        ) : null}
      </div>
    </header>
  );
}
