"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const ONBOARDING_KEY = "lock-in-guide-onboarding-v1";

const STEPS = [
  "Welcome to Lock-In — track every job application in one place.",
  "Connect ChatGPT in Settings to auto-fill fields from job postings you paste.",
  "Add applications via New Application — paste a job description, extract fields, then save.",
  "Manage everything on Dashboard — search, filter, and update application status.",
] as const;

export function FirstRunGuideOverlay() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (localStorage.getItem(ONBOARDING_KEY) !== "1") {
        setShow(true);
      }
    } catch {
      setShow(false);
    }
  }, []);

  if (!show) return null;

  const isLast = step === STEPS.length - 1;

  function complete() {
    try {
      localStorage.setItem(ONBOARDING_KEY, "1");
    } catch {
      // ponytail: localStorage blocked — overlay may reappear next visit
    }
    setShow(false);
  }

  function handleNext() {
    if (isLast) {
      complete();
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="mx-4 flex max-w-sm flex-col gap-6 rounded-xl border border-border bg-card p-6 shadow-lg">
        <p className="text-center text-sm leading-relaxed text-foreground">
          {STEPS[step]}
        </p>
        <div className="flex w-full flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {step + 1} / {STEPS.length}
            </span>
            <Button type="button" size="sm" onClick={handleNext}>
              {isLast ? "Got it" : "Next"}
            </Button>
          </div>
          <Link
            href="/guide"
            onClick={complete}
            className="text-center text-xs text-muted-foreground underline hover:text-foreground"
          >
            View full guide
          </Link>
        </div>
      </div>
    </div>
  );
}
