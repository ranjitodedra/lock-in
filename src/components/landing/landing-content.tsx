"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { AppLogo } from "@/components/brand/app-logo";
import { WorkflowPipeline } from "@/components/landing/workflow-pipeline";
import {
  fadeDown,
  fadeUp,
  motionTransition,
  scaleIn,
  staggerContainer,
  staggerContainerFast,
} from "@/components/motion/motion-presets";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

type LandingContentProps = {
  user: { id: string } | null;
  primaryHref: string;
  secondaryHref: string;
};

export function LandingContent({
  user,
  primaryHref,
  secondaryHref,
}: LandingContentProps) {
  const reducedMotion = useReducedMotion();
  const transition = motionTransition(reducedMotion, 0.45);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,var(--brand-muted)_0%,transparent_60%)]"
        aria-hidden
      />

      <motion.header
        className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainerFast}
      >
        <motion.div className="flex items-center gap-2" variants={fadeDown}>
          <AppLogo width={32} height={32} priority />
          <span className="text-lg font-semibold tracking-tight">
            Lock-In Tracker
          </span>
        </motion.div>
        <motion.div
          className="flex items-center gap-3"
          variants={fadeDown}
          transition={transition}
        >
          {user ? (
            <Button
              variant="ghost"
              render={<Link href="/dashboard" />}
              nativeButton={false}
            >
              Dashboard
            </Button>
          ) : (
            <Button
              variant="brand"
              render={<Link href={primaryHref} />}
              nativeButton={false}
            >
              Get started
              <ArrowRight data-icon="inline-end" />
            </Button>
          )}
        </motion.div>
      </motion.header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 pb-20 pt-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-center text-center"
        >
          <motion.div
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-brand-border bg-brand-muted px-3 py-1 text-xs text-brand shadow-[0_0_20px_oklch(0.52_0.22_264_/_15%)] dark:shadow-[0_0_24px_oklch(0.62_0.2_264_/_20%)]"
            variants={scaleIn}
            transition={transition}
          >
            <Sparkles className="size-3.5 text-brand" />
            AI extraction with your own ChatGPT account
          </motion.div>

          <motion.h1
            className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl"
            variants={fadeUp}
            transition={transition}
          >
            Track every job application in{" "}
            <span className="whitespace-nowrap text-brand">one dashboard</span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-2xl text-lg text-muted-foreground"
            variants={fadeUp}
            transition={transition}
          >
            Paste a job description. Lock-In extracts company, role, deadline,
            skills, and more into a structured record you can edit and track.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap justify-center gap-3"
            variants={fadeUp}
            transition={transition}
          >
            <Button
              variant="brand"
              size="lg"
              render={<Link href={primaryHref} />}
              nativeButton={false}
            >
              {user ? "Open dashboard" : "Sign in to start"}
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href={secondaryHref} />}
              nativeButton={false}
            >
              New application
            </Button>
          </motion.div>
        </motion.div>

        <WorkflowPipeline />
      </main>

      <footer className="relative z-10 border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        <div>
          <Link href="/manifesto" className="hover:text-foreground">
            Manifesto
          </Link>
          {" · "}
          <Link href="/legal/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          {" · "}
          <Link href="/legal/terms" className="hover:text-foreground">
            Terms
          </Link>
        </div>
        <div className="mt-2">
          © {new Date().getFullYear()} Ranjit Odedra
          {" · "}
          <a
            href="https://x.com/Ranjit0dedra"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            X
          </a>
        </div>
      </footer>
    </div>
  );
}
