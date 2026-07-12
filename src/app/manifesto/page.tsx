import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Manifesto",
  description:
    "Why Lock-In exists — free job application tracking built by a fellow job seeker.",
};

const BUY_ME_A_COFFEE_URL = "https://buymeacoffee.com/ranjitodedra";
const X_PROFILE_URL = "https://x.com/Ranjit0dedra";

export default function ManifestoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Lock-In
        </Link>

        <article className="mt-8">
          <h1 className="text-3xl font-semibold tracking-tight">Manifesto</h1>

          <p className="mt-6 text-sm leading-7 text-muted-foreground">
            As a fellow job seeker, I know the pain of applying to hundreds of
            roles across different platforms, and I absolutely hate manually
            entering each job one by one. There was no easy way to automate
            this, so I built this platform for myself and people just like me.
          </p>

          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            I want it to stay free, because I know what it&apos;s like to be out
            of work. And once you do get a job, if you feel grateful, I hope
            you&apos;ll consider making a small donation to keep the servers
            running, maintaining the dashboard for future applicants.
          </p>

          <div className="mt-8">
            <Button
              variant="brand"
              render={
                <a
                  href={BUY_ME_A_COFFEE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              nativeButton={false}
            >
              Buy me a coffee
            </Button>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            —{" "}
            <a
              href={X_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              @Ranjit0dedra on X
            </a>
          </p>
        </article>
      </div>
    </div>
  );
}
