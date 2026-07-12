import Image from "next/image";

type ChatGptLoginGuideProps = {
  device?: {
    user_code: string;
    verification_uri: string;
  } | null;
  compact?: boolean;
};

export function ChatGptLoginGuide({ device, compact = false }: ChatGptLoginGuideProps) {
  const showDeviceSteps = Boolean(device);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Step 1: Enable from ChatGPT</p>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Log in to the ChatGPT account you want to use.</li>
          <li>Open <span className="font-medium text-foreground">Settings</span>.</li>
          <li>
            Open <span className="font-medium text-foreground">Security and login</span>{" "}
            and scroll to the bottom.
          </li>
          <li>
            Enable{" "}
            <span className="font-medium text-foreground">
              Enable device code authorization for Codex
            </span>
            .
          </li>
        </ol>
        {!compact ? (
          <Image
            src="/gpt_settings.png"
            alt="ChatGPT Settings: Security and login, then enable device code authorization for Codex"
            width={960}
            height={540}
            className="mt-2 w-full max-w-lg rounded-lg border border-border"
          />
        ) : null}
      </div>

      {showDeviceSteps ? (
        <>
          <div className="space-y-2">
            <p className="text-sm font-medium">Step 2: Open verification URL</p>
            <p className="text-sm text-muted-foreground">
              Click this URL in your browser:
            </p>
            <p>
              <a
                href={device!.verification_uri}
                target="_blank"
                rel="noreferrer"
                className="text-sm underline"
              >
                {device!.verification_uri}
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Step 3: Enter code</p>
            <p className="text-sm text-muted-foreground">
              Enter this one-time code on the ChatGPT page:
            </p>
            <p className="rounded-md bg-muted px-3 py-2 text-center font-mono text-lg tracking-widest">
              {device!.user_code}
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
