import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "lock-in-tracker" });

export const EXTRACTION_REQUESTED_EVENT = "extraction/requested" as const;
