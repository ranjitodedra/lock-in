"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

import { fadeUp, motionTransition } from "@/components/motion/motion-presets";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

type FadeInViewProps = HTMLMotionProps<"div"> & {
  delay?: number;
};

export function FadeInView({
  children,
  delay = 0,
  ...props
}: FadeInViewProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUp}
      transition={{
        ...motionTransition(reducedMotion, 0.45),
        delay: reducedMotion ? 0 : delay,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
