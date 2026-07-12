import { createClient } from "@/lib/supabase/server";

export async function tryRecordExtraction(
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_and_record_extraction", {
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    throw new Error("Failed to check extraction rate limit");
  }

  return data === true;
}
