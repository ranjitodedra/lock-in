"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";

import { AppLogo } from "@/components/brand/app-logo";
import { fadeUp, motionTransition } from "@/components/motion/motion-presets";

import { authCallbackUrl } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

type LoginFormProps = {
  nextPath: string;
  errorCode?: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  auth_callback_error: "Sign-in failed. Please try again.",
  invalid_redirect: "Invalid redirect. Please try again.",
};

export function LoginForm({ nextPath, errorCode }: LoginFormProps) {
  const reducedMotion = useReducedMotion();
  const transition = motionTransition(reducedMotion, 0.45);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState<string | null>(
    errorCode ? (ERROR_MESSAGES[errorCode] ?? "Something went wrong.") : null,
  );

  const callbackWithNext = `${authCallbackUrl()}?next=${encodeURIComponent(nextPath)}`;

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading("email");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: callbackWithNext },
    });

    setLoading(null);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    setSent(true);
  }

  async function handleGoogle() {
    setError(null);
    setLoading("google");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackWithNext },
    });

    if (signInError) {
      setLoading(null);
      setError(signInError.message);
    }
  }

  if (sent) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={transition}
      >
        <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <CardTitle>Check your inbox</CardTitle>
          <CardDescription>
            We sent a sign-in link to <strong>{email}</strong>. Click it to
            continue to Lock-In.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSent(false)}
          >
            Use a different email
          </Button>
        </CardContent>
      </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      transition={{ ...transition, delay: 0.08 }}
    >
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader>
        <CardTitle>Sign in to Lock-In</CardTitle>
        <CardDescription>
          Create an account or sign in with email or Google. No password needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <form onSubmit={handleMagicLink} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading !== null}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading !== null || !email.trim()}
          >
            <Mail data-icon="inline-start" />
            {loading === "email" ? "Sending link…" : "Continue with email"}
          </Button>
        </form>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            or
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogle}
          disabled={loading !== null}
        >
          {loading === "google" ? "Redirecting…" : "Continue with Google"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="/legal/terms" className="underline hover:text-foreground">
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/legal/privacy"
            className="underline hover:text-foreground"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </CardContent>
    </Card>
    </motion.div>
  );
}

export function LoginBrand() {
  const reducedMotion = useReducedMotion();
  const transition = motionTransition(reducedMotion, 0.45);

  return (
    <motion.div
      className="mb-8 flex flex-col items-center gap-2 text-center"
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      transition={transition}
    >
      <AppLogo width={40} height={40} priority />
      <span className="text-lg font-semibold tracking-tight">
        Lock-In Tracker
      </span>
    </motion.div>
  );
}
