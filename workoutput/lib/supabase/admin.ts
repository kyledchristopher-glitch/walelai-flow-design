import { createClient } from "@supabase/supabase-js";

// Service-role client. Bypasses RLS. Use ONLY in server routes that have no user session,
// such as the Stripe webhook. Never import this into client code.
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
  if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");

  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}
