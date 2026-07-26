"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    id: "what",
    question: "What is Lock-In Tracker?",
    answer:
      "A focused app for tracking job applications — paste a posting, keep status and follow-ups in one place, and skip the spreadsheet chaos.",
  },
  {
    id: "free",
    question: "Is it free to use?",
    answer:
      "Yes. Sign in and start tracking applications. AI extraction uses your own ChatGPT account when you choose to extract from a posting.",
  },
  {
    id: "connect",
    question: "Do I need to connect my email or LinkedIn?",
    answer:
      "No. You paste job details yourself (or extract with ChatGPT). Nothing scrapes your inbox or LinkedIn automatically.",
  },
  {
    id: "import",
    question: "Can I import from a spreadsheet?",
    answer:
      "Not yet. Add applications one at a time for now — structured paste and AI extraction keep that fast enough for most searches.",
  },
  {
    id: "data",
    question: "Where is my data stored?",
    answer:
      "Your applications live in a secured database tied to your account. You control what you add; see Privacy for the full picture.",
  },
] as const;

export function LandingFaq() {
  const reducedMotion = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);

  return (
    <section
      className="mt-20 flex w-full flex-col items-center gap-10"
      aria-labelledby="faq-heading"
    >
      <h2
        id="faq-heading"
        className="text-center text-3xl font-bold tracking-tight md:text-4xl"
      >
        FAQ
      </h2>

      <div className="flex w-full max-w-xl flex-col gap-3 sm:max-w-2xl">
        {FAQ_ITEMS.map((item) => {
          const open = openId === item.id;
          return (
            <div
              key={item.id}
              className={cn(
                "overflow-hidden rounded-[var(--radius)] border bg-background",
                open ? "border-brand bg-brand-muted/40" : "border-border",
              )}
            >
              <button
                type="button"
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                onClick={() => setOpenId(open ? null : item.id)}
              >
                <span className="text-base font-medium">{item.question}</span>
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full",
                    open ? "bg-brand/12 text-brand" : "bg-muted text-muted-foreground",
                  )}
                >
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform duration-200",
                      open && "rotate-180",
                    )}
                  />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open ? (
                  <motion.div
                    key="answer"
                    initial={
                      reducedMotion
                        ? false
                        : { height: 0, opacity: 0 }
                    }
                    animate={{ height: "auto", opacity: 1 }}
                    exit={
                      reducedMotion
                        ? undefined
                        : { height: 0, opacity: 0 }
                    }
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm leading-7 text-muted-foreground">
                      {item.answer}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
