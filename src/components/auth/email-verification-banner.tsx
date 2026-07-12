"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type EmailVerificationBannerProps = {
  user: User;
};

export function EmailVerificationBanner({ user }: EmailVerificationBannerProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user.email_confirmed_at) {
    return null;
  }

  async function handleResend() {
    if (!user.email) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
    });

    setLoading(false);
    if (resendError) {
      setError(resendError.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-6 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-amber-950 dark:text-amber-50">
          {sent
            ? "Verification email sent. Check your inbox."
            : "Verify your email to save applications. You can browse the dashboard meanwhile."}
        </p>
        {!sent ? (
          <Button
            size="sm"
            variant="outline"
            onClick={handleResend}
            disabled={loading}
          >
            {loading ? "Sending…" : "Resend verification email"}
          </Button>
        ) : null}
      </div>
      {error ? (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
