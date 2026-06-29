import type { SupabaseClient } from "@supabase/supabase-js";

// Read-only window count for display (entitlements). Enforcement is done by the
// consume_usage SECURITY DEFINER function in the database, not here.
export async function countWindow(
  supabase: SupabaseClient,
  userId: string,
  kind: string,
  days: number,
) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("kind", kind)
    .gte("created_at", since);
  return count || 0;
}
