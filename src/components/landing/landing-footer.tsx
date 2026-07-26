import Link from "next/link";

import { AppLogo } from "@/components/brand/app-logo";
import {
  GithubIcon,
  LinkedinIcon,
  XIcon,
} from "@/components/brand/social-icons";

const GITHUB_URL = "https://github.com/ranjitodedra/lock-in";
const X_URL = "https://x.com/Ranjit0dedra";
const LINKEDIN_URL = "https://www.linkedin.com/in/ranjitodedra";
const EMAIL = "ranjitodedra.dev@gmail.com";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-border bg-muted/40 px-6 pt-16 pb-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-sm space-y-4">
            <div className="flex items-center gap-2">
              <AppLogo width={32} height={32} />
              <span className="text-lg font-semibold tracking-tight">
                Lock-In Tracker
              </span>
            </div>
            <p className="text-sm leading-7 text-muted-foreground">
              Job application tracking without the spreadsheet tax. Built by
              Ranjit Odedra.
            </p>
            <a
              href={`mailto:${EMAIL}`}
              className="inline-block text-sm text-brand hover:underline"
            >
              {EMAIL}
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium tracking-[0.06em] text-muted-foreground uppercase">
              Product
            </p>
            <Link
              href="/manifesto"
              className="text-sm hover:text-foreground"
            >
              Manifesto
            </Link>
            <Link
              href="/legal/privacy"
              className="text-sm hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/legal/terms"
              className="text-sm hover:text-foreground"
            >
              Terms
            </Link>
          </div>
        </div>

        <div className="flex flex-col-reverse items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {year} Ranjit Odedra. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <a
              href={X_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="inline-flex size-9 items-center justify-center rounded-[var(--radius)] border border-border bg-background text-foreground hover:bg-muted"
            >
              <XIcon className="size-3.5" />
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="inline-flex size-9 items-center justify-center rounded-[var(--radius)] border border-border bg-background text-foreground hover:bg-muted"
            >
              <LinkedinIcon className="size-3.5" />
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="inline-flex size-9 items-center justify-center rounded-[var(--radius)] border border-border bg-background text-foreground hover:bg-muted"
            >
              <GithubIcon className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
