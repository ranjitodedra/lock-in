"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { AppLogo } from "@/components/brand/app-logo";
import { GithubIcon } from "@/components/brand/social-icons";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingVideo } from "@/components/landing/landing-video";
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

const GITHUB_URL = "https://github.com/ranjitodedra/lock-in";

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
      {/* Paper “Brand glow” — page-level blue shine */}
      <div className="landing-brand-glow pointer-events-none absolute inset-0" aria-hidden />

      {/* Paper hero: centered type, no hero image */}
      <section className="relative z-10 flex flex-col">
        <motion.header
          className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-6 py-6"
          initial="hidden"
          animate="visible"
          variants={staggerContainerFast}
        >
          <motion.div className="flex min-w-0 items-center gap-2" variants={fadeDown}>
            <AppLogo width={32} height={32} priority />
            <span className="truncate text-lg font-semibold tracking-tight">
              Lock-In Tracker
            </span>
          </motion.div>
          <motion.div
            className="flex shrink-0 items-center gap-2 sm:gap-3"
            variants={fadeDown}
            transition={transition}
          >
            <Button
              variant="outline"
              render={
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              nativeButton={false}
            >
              <GithubIcon className="size-4" data-icon="inline-start" />
              <span className="hidden sm:inline">GitHub</span>
            </Button>
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

        <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-16 pt-10 sm:pt-14 md:pb-20 md:pt-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex w-full flex-col items-center text-center"
          >
            <motion.div
              className="inline-flex w-fit items-center gap-2 rounded-[10px] border border-brand-border bg-brand-muted px-3 py-1 text-xs text-brand shadow-[0_0_20px_#2258E526]"
              variants={scaleIn}
              transition={transition}
            >
              <Sparkles className="size-3.5 text-brand" />
              AI extraction with your own ChatGPT account
            </motion.div>

            <motion.h1
              className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
              variants={fadeUp}
              transition={transition}
            >
              Track every job application in{" "}
              <span className="text-brand">one dashboard</span>
            </motion.h1>

            <motion.p
              className="mt-6 max-w-2xl text-lg leading-7 text-muted-foreground"
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
        </div>
      </section>

      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-6 pb-20 pt-4">
        <WorkflowPipeline />
        <LandingVideo />
        <LandingFaq />
      </main>

      <LandingFooter />
    </div>
  );
}
