"use client";

import type { ReactNode } from "react";

import { setBrowserSupabaseConfig } from "@/lib/supabase/browser-config";

type SupabaseBrowserProviderProps = {
  url: string;
  anonKey: string;
  appUrl?: string;
  sentryDsn?: string;
  children: ReactNode;
};

export function SupabaseBrowserProvider({
  url,
  anonKey,
  appUrl,
  sentryDsn,
  children,
}: SupabaseBrowserProviderProps) {
  setBrowserSupabaseConfig({ url, anonKey, appUrl, sentryDsn });
  return children;
}
