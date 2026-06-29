"use client";
import { createClient } from "@/lib/supabase/client";

// Supabase-backed replacement for the monolith's artifact key/value store. Same shape:
// get returns { value } or null, set/delete/list operate on the current user's rows.
// RLS scopes every row to auth.uid(), so no user_id needs to be trusted from the client.
const supabase = createClient();

async function uid(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export const store = {
  async get(key: string): Promise<{ value: string } | null> {
    const u = await uid();
    if (!u) return null;
    const { data } = await supabase
      .from("kv")
      .select("value")
      .eq("user_id", u)
      .eq("key", key)
      .maybeSingle();
    return data ? { value: data.value as string } : null;
  },
  async set(key: string, value: string): Promise<void> {
    const u = await uid();
    if (!u) return;
    await supabase
      .from("kv")
      .upsert(
        { user_id: u, key, value, updated_at: new Date().toISOString() },
        { onConflict: "user_id,key" },
      );
  },
  async delete(key: string): Promise<void> {
    const u = await uid();
    if (!u) return;
    await supabase.from("kv").delete().eq("user_id", u).eq("key", key);
  },
  async list(prefix = ""): Promise<string[]> {
    const u = await uid();
    if (!u) return [];
    const { data } = await supabase
      .from("kv")
      .select("key")
      .eq("user_id", u)
      .like("key", `${prefix}%`);
    return (data || []).map((r: { key: string }) => r.key);
  },
};
