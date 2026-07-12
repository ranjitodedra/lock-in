import type { ApplicationListRow } from "@/types/application";
import { createClient } from "@/lib/supabase/server";
import {
  decodeCursor,
  encodeCursor,
  keysetOrFilter,
} from "@/lib/applications/queries-cursor";

export const LIST_COLUMNS =
  "id,user_id,status,company,job_title,location,country,work_mode,employment_type,salary,application_deadline,follow_up_date,applied_at,skills,technologies,created_at,updated_at";

export const DEFAULT_LIST_PAGE_SIZE = 50;

export type ListApplicationsPageResult = {
  items: ApplicationListRow[];
  nextCursor: string | null;
  totalCount: number;
};

export async function listApplicationsPage({
  limit = DEFAULT_LIST_PAGE_SIZE,
  cursor,
}: {
  limit?: number;
  cursor?: string;
} = {}): Promise<ListApplicationsPageResult> {
  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true });

  if (countError) {
    throw countError;
  }

  let query = supabase
    .from("applications")
    .select(LIST_COLUMNS)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      query = query.or(keysetOrFilter(decoded));
    }
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as ApplicationListRow[];
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items.at(-1);
  const nextCursor =
    hasMore && last ? encodeCursor({ created_at: last.created_at, id: last.id }) : null;

  return {
    items,
    nextCursor,
    totalCount: count ?? 0,
  };
}

export async function getApplication(
  id: string,
): Promise<import("@/types/application").ApplicationRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
