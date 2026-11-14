"use client";

import type { ReactNode } from "react";

import { setBrowserSupabaseConfig } from "@/lib/supabase/browser-config";

type SupabaseBrowserProviderProps = {
  url: string;
  anonKey: string;
  children: ReactNode;
};

export function SupabaseBrowserProvider({
  url,
  anonKey,
  children,
}: SupabaseBrowserProviderProps) {
  setBrowserSupabaseConfig({ url, anonKey });
  return children;
}
