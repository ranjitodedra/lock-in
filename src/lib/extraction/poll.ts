import type { JobExtraction } from "@/types/application";

const POLL_INTERVAL_MS = 2_000;
const POLL_TIMEOUT_MS = 90_000;

export type PollExtractionResult =
  | { kind: "completed"; data: JobExtraction }
  | { kind: "failed"; error: string; message: string }
  | { kind: "timeout" };

type PollJson =
  | { status: "pending" | "processing" }
  | { status: "completed"; data: JobExtraction }
  | { status: "failed"; error: string; message: string };

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

/** Polls GET /api/extract/[jobId] until terminal status or timeout. */
export async function pollExtractionJob(
  jobId: string,
  signal: AbortSignal,
): Promise<PollExtractionResult> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if (signal.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    const res = await fetch(`/api/extract/${jobId}`, { signal });
    const body = (await res.json().catch(() => null)) as PollJson | null;

    if (!res.ok || !body || !("status" in body)) {
      return {
        kind: "failed",
        error: "extraction_failed",
        message: "Extraction failed. Try again or fill in fields manually.",
      };
    }

    if (body.status === "completed") {
      return { kind: "completed", data: body.data };
    }
    if (body.status === "failed") {
      return {
        kind: "failed",
        error: body.error,
        message: body.message,
      };
    }

    await sleep(POLL_INTERVAL_MS, signal);
  }

  return { kind: "timeout" };
}
