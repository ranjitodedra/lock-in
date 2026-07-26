"use client";

import { FileText, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { FadeInView } from "@/components/motion/fade-in-view";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { cn } from "@/lib/utils";

const NODES = [
  {
    title: "Your ChatGPT",
    subtitle: "Log in to your ChatGPT account",
    imageSrc: "/openai.svg",
  },
  {
    title: "Paste posting",
    subtitle: "Drop a full job description",
    Icon: FileText,
    iconClassName: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Dashboard",
    subtitle: "Structured application tracker",
    Icon: LayoutDashboard,
    iconClassName: "text-emerald-600 dark:text-emerald-400",
  },
] as const;

function beamPath(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  curvature: number,
  curveDown = false,
): string {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  // Cubic with shared peak Y → round U instead of sharp quadratic tip.
  if (Math.abs(dx) > Math.abs(dy)) {
    const peakY =
      (p1.y + p2.y) / 2 + (curveDown ? curvature : -curvature);
    const c1x = p1.x + dx * 0.35;
    const c2x = p2.x - dx * 0.35;
    return `M ${p1.x} ${p1.y} C ${c1x} ${peakY}, ${c2x} ${peakY}, ${p2.x} ${p2.y}`;
  }
  const peakX = (p1.x + p2.x) / 2 + curvature;
  const c1y = p1.y + dy * 0.35;
  const c2y = p2.y - dy * 0.35;
  return `M ${p1.x} ${p1.y} C ${peakX} ${c1y}, ${peakX} ${c2y}, ${p2.x} ${p2.y}`;
}

export function WorkflowPipeline() {
  const reducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [paths, setPaths] = useState({ track1: "", flow1: "", track2: "", flow2: "" });
  const [userAnimating, setUserAnimating] = useState(true);
  const animating = reducedMotion ? false : userAnimating;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const drawBeams = useCallback(() => {
    const card = cardRef.current;
    const n1 = iconRefs.current[0];
    const n2 = iconRefs.current[1];
    const n3 = iconRefs.current[2];
    if (!card || !n1 || !n2 || !n3) return;

    const cRect = card.getBoundingClientRect();
    // Anchor to icon circles only — matches Paper (not the title block).
    const center = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2 - cRect.left,
        y: rect.top + rect.height / 2 - cRect.top,
      };
    };

    const p1 = center(n1);
    const p2 = center(n2);
    const p3 = center(n3);
    const horizontal = Math.abs(p2.x - p1.x) > Math.abs(p2.y - p1.y);
    // Paper desktop: Q peaks ~60px off the icon midline.
    const curvature = horizontal ? 60 : 48;

    setPaths({
      track1: beamPath(p1, p2, curvature),
      flow1: beamPath(p1, p2, curvature),
      track2: beamPath(p2, p3, curvature, true),
      flow2: beamPath(p2, p3, curvature, true),
    });
  }, []);

  useLayoutEffect(() => {
    drawBeams();
    const card = cardRef.current;
    if (!card) return;

    const ro = new ResizeObserver(drawBeams);
    ro.observe(card);
    for (const icon of iconRefs.current) {
      if (icon) ro.observe(icon);
    }
    window.addEventListener("resize", drawBeams);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", drawBeams);
    };
  }, [drawBeams]);

  function flowOpacity(beamIndex: 0 | 1): number {
    if (!animating) return 0.3;
    if (hoveredIndex === null) return 1;
    if (hoveredIndex === 0) return beamIndex === 0 ? 1 : 0.15;
    if (hoveredIndex === 1) return 1;
    if (hoveredIndex === 2) return beamIndex === 1 ? 1 : 0.15;
    return 1;
  }

  return (
    <FadeInView className="relative mt-16 w-full">
      <div className="relative z-10">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight md:text-4xl">
          How it works
        </h2>

        <div
          ref={cardRef}
          className={cn(
            // overflow-visible so curved beams aren't clipped (Paper peaks above icon row)
            "relative overflow-visible rounded-3xl border border-border bg-card p-10 shadow-[0_0_40px_-12px_rgba(0,0,0,0.12)] md:p-20",
            !animating && "workflow-pipeline-paused",
          )}
        >
          <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              Flow animation
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={animating}
              aria-label="Toggle flow animation"
              onClick={() => setUserAnimating((v) => !v)}
              className={cn(
                "relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                animating ? "bg-brand" : "bg-muted",
              )}
            >
              <span
                className={cn(
                  "inline-block size-5 rounded-full bg-background shadow transition-transform duration-200",
                  animating ? "translate-x-6" : "translate-x-1",
                )}
              />
            </button>
          </div>

          <svg
            className="pointer-events-none absolute inset-0 z-0 size-full overflow-visible"
            aria-hidden
          >
            <path
              d={paths.track1}
              fill="none"
              className="stroke-border"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <path
              d={paths.flow1}
              fill="none"
              className="workflow-pipeline-beam stroke-brand transition-opacity duration-300"
              strokeWidth={3}
              strokeLinecap="round"
              style={{ opacity: flowOpacity(0) }}
            />
            <path
              d={paths.track2}
              fill="none"
              className="stroke-border"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <path
              d={paths.flow2}
              fill="none"
              className="workflow-pipeline-beam stroke-brand transition-opacity duration-300"
              strokeWidth={3}
              strokeLinecap="round"
              style={{ opacity: flowOpacity(1) }}
            />
          </svg>

          <div className="relative z-10 flex flex-col items-center justify-between gap-16 md:flex-row md:gap-8">
            {NODES.map((node, index) => (
              <div
                key={node.title}
                className={cn(
                  "group flex cursor-default flex-col items-center text-center transition-opacity duration-300",
                  hoveredIndex !== null &&
                    hoveredIndex !== index &&
                    "opacity-35",
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  ref={(el) => {
                    iconRefs.current[index] = el;
                  }}
                  className="relative z-10 flex size-20 items-center justify-center rounded-full border border-border bg-card shadow-[0_0_20px_-12px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:scale-110 group-hover:ring-4 group-hover:ring-brand/15"
                >
                  {"imageSrc" in node ? (
                    <Image
                      src={node.imageSrc}
                      alt=""
                      width={36}
                      height={36}
                      className="size-9"
                      aria-hidden
                    />
                  ) : (
                    <node.Icon className={cn("size-9", node.iconClassName)} />
                  )}
                </div>
                <div className="mt-5">
                  <h3 className="text-base font-semibold">{node.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {node.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FadeInView>
  );
}
