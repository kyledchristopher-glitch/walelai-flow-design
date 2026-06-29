"use client";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// Replaces the monolith's recordMetric. Best-effort; never throws into the UI.
export async function recordMetric(event: string, loop?: string) {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await supabase.from("metrics").insert({ user_id: data.user.id, event, loop: loop ?? null });
  } catch {
    // swallow
  }
}
