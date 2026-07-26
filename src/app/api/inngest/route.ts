import { serve } from "inngest/next";

import { inngest } from "@/lib/inngest/client";
import { processExtractionJob } from "@/lib/inngest/functions/extract-job";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processExtractionJob],
});
