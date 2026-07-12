"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { LoginWithChatGPT } from "@/components/codex/login-with-chatgpt";
import { Button } from "@/components/ui/button";
import type { ChatGptConnection } from "@/lib/codex/session";

type ChatGptConnectionCardProps = {
  initialConnection: ChatGptConnection;
};

function formatExpiry(expiresAt: number): string {
  return new Date(expiresAt * 1000).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ChatGptConnectionCard({
  initialConnection,
}: ChatGptConnectionCardProps) {
  const router = useRouter();
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDisconnect() {
    setDisconnecting(true);
    setError(null);

    try {
      const res = await fetch("/api/codex/auth/logout", { method: "POST" });
      if (!res.ok) {
        setError("Failed to disconnect.");
        return;
      }
      router.refresh();
    } catch {
      setError("Failed to disconnect.");
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-sm font-medium">ChatGPT connection</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Connect your ChatGPT subscription to extract job fields without the app
        owner paying API costs.
      </p>

      {initialConnection.connected ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm">
            Connected
            {initialConnection.email ? (
              <>
                {" "}
                as <span className="font-medium">{initialConnection.email}</span>
              </>
            ) : null}
            {initialConnection.planType ? (
              <>
                {" "}
                · <span className="capitalize">{initialConnection.planType}</span>
              </>
            ) : null}
            {initialConnection.expiresAt ? (
              <> · expires {formatExpiry(initialConnection.expiresAt)}</>
            ) : null}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleDisconnect}
            disabled={disconnecting}
          >
            {disconnecting ? "Disconnecting…" : "Disconnect"}
          </Button>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-4">
          <LoginWithChatGPT />
        </div>
      )}
    </section>
  );
}
