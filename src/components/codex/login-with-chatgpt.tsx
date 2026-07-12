"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ChatGptLoginGuide } from "@/components/guide/chatgpt-login-guide";
import { Button } from "@/components/ui/button";

const CONSENT_COPY =
  "Lock-In uses your ChatGPT subscription only to extract job fields from text you paste. We do not use it for general chat.";

type DeviceInfo = {
  user_code: string;
  verification_uri: string;
  interval: number;
};

type LoginWithChatGPTProps = {
  onConnected?: () => void;
};

export function LoginWithChatGPT({ onConnected }: LoginWithChatGPTProps) {
  const router = useRouter();
  const [screen, setScreen] = useState<"idle" | "device">("idle");
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [starting, setStarting] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pollTimer.current) {
        clearTimeout(pollTimer.current);
      }
    };
  }, []);

  function stopPolling() {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  }

  async function startPoll(intervalSeconds: number) {
    const poll = async () => {
      try {
        const res = await fetch("/api/codex/auth/poll", { method: "POST" });
        const data = (await res.json()) as {
          status?: string;
          message?: string;
        };

        if (data.status === "complete") {
          stopPolling();
          setScreen("idle");
          setDevice(null);
          onConnected?.();
          router.refresh();
          return;
        }
        if (data.status === "error") {
          stopPolling();
          setPollError(data.message ?? "Authorization failed");
          return;
        }
        pollTimer.current = setTimeout(poll, intervalSeconds * 1000);
      } catch {
        stopPolling();
        setPollError("Poll request failed");
      }
    };
    poll();
  }

  async function handleStart() {
    setStarting(true);
    setPollError(null);

    try {
      const res = await fetch("/api/codex/auth/start", { method: "POST" });
      const data = (await res.json()) as DeviceInfo & { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to start login");
      }
      setDevice(data);
      setScreen("device");
      await startPoll(data.interval ?? 5);
    } catch (err) {
      setPollError(err instanceof Error ? err.message : "Failed to start");
      setScreen("idle");
    } finally {
      setStarting(false);
    }
  }

  if (screen === "device" && device) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">{CONSENT_COPY}</p>
        <ChatGptLoginGuide device={device} compact />
        <p className="text-sm text-muted-foreground">
          Waiting for you to approve access…
        </p>
        {pollError ? (
          <p className="text-sm text-destructive" role="alert">
            {pollError}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{CONSENT_COPY}</p>
      <ChatGptLoginGuide />
      <p className="text-xs text-muted-foreground">
        Uses an experimental unofficial OAuth flow. See{" "}
        <Link href="/legal/terms" className="underline hover:text-foreground">
          Terms
        </Link>{" "}
        for details.
      </p>
      <Button type="button" onClick={handleStart} disabled={starting}>
        {starting ? "Starting…" : "Connect ChatGPT"}
      </Button>
      {pollError ? (
        <p className="text-sm text-destructive" role="alert">
          {pollError}
        </p>
      ) : null}
    </div>
  );
}

export { CONSENT_COPY };
