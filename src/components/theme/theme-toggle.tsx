"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

const CYCLE = ["light", "dark", "system"] as const;

function subscribe() {
  return () => {};
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  if (!mounted) {
    return (
      <Button type="button" variant="outline" size="icon" disabled aria-label="Theme">
        <Sun className="size-4" />
      </Button>
    );
  }

  const current = (theme ?? "system") as (typeof CYCLE)[number];
  const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];

  const Icon =
    current === "dark" ? Moon : current === "light" ? Sun : Monitor;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${current}. Switch to ${next}.`}
      title={`Theme: ${current}`}
    >
      <Icon className="size-4" />
    </Button>
  );
}
