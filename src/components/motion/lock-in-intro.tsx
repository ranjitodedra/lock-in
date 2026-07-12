"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SESSION_KEY = "lock-in-intro-v1";

const WORDS = ["LOCK", "IN"] as const;

function shouldShowIntro(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return false;
  } catch {
    return false;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // ponytail: sessionStorage may be unavailable in private mode edge cases
    }
    return false;
  }
  return true;
}

const letterVariants = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.06,
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export function LockInIntro() {
  const initialShow = shouldShowIntro();
  const [show, setShow] = useState(initialShow);
  const [mounted, setMounted] = useState(initialShow);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // ponytail: sessionStorage may be unavailable in private mode edge cases
    }
    setShow(false);
  }, []);

  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(dismiss, 2200);
    return () => clearTimeout(timer);
  }, [show, dismiss]);

  useEffect(() => {
    if (!show) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "Enter") dismiss();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [show, dismiss]);

  if (!mounted) return null;

  return (
    <AnimatePresence onExitComplete={() => setMounted(false)}>
      {show ? (
        <motion.div
          key="lock-in-intro"
          className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          onClick={dismiss}
          role="dialog"
          aria-label="Lock In intro"
        >
          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.15 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {WORDS.map((word, wordIndex) => (
              <motion.div
                key={word}
                className="flex overflow-hidden text-7xl font-bold tracking-tighter text-white sm:text-8xl"
                aria-hidden
                animate={
                  wordIndex === 1
                    ? { scale: [1, 1.04, 1] }
                    : undefined
                }
                transition={
                  wordIndex === 1
                    ? { delay: 0.9, duration: 0.5, ease: "easeInOut" }
                    : undefined
                }
              >
                {word.split("").map((letter, i) => (
                  <motion.span
                    key={`${word}-${letter}-${i}`}
                    custom={wordIndex * 4 + i}
                    variants={letterVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {letter}
                  </motion.span>
                ))}
              </motion.div>
            ))}

            <motion.div
              className="mt-4 h-px bg-white"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 120, opacity: 0.6 }}
              transition={{ delay: 0.5, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.span
              className="mt-2 text-xs tracking-[0.3em] text-white/40 uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.3 }}
            >
              Tap to skip
            </motion.span>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
