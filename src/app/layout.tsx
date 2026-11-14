import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

import { SupabaseBrowserProvider } from "@/components/auth/supabase-browser-provider";
import { LockInIntro } from "@/components/motion/lock-in-intro";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { env } from "@/env";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lock-In: Job Application Tracker",
    template: "%s · Lock-In",
  },
  description:
    "Track job applications with AI-powered extraction from pasted job descriptions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans">
        <SupabaseBrowserProvider
          url={env.SUPABASE_URL}
          anonKey={env.SUPABASE_ANON_KEY}
          appUrl={env.APP_URL}
          sentryDsn={env.SENTRY_DSN}
        >
          <ThemeProvider>
            <LockInIntro />
            {children}
            <Toaster richColors closeButton />
            <Analytics />
          </ThemeProvider>
        </SupabaseBrowserProvider>
      </body>
    </html>
  );
}
