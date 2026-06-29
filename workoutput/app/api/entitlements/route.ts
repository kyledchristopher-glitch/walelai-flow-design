import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { policyFor, INTELLIGENCE_CREDIT_POLICY, type Tier } from "@/lib/tiers";
import { countWindow } from "@/lib/limits";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ tier: null });

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier, created_at")
    .eq("id", user.id)
    .single();

  const tier = (profile?.tier as Tier) || "free";
  const [monthUsed, dailyUsed, creditsUsed] = await Promise.all([
    countWindow(supabase, user.id, "decision", 30),
    countWindow(supabase, user.id, "daily_session", 1),
    countWindow(supabase, user.id, "credit", 30),
  ]);

  // Reset window anchored on the account creation date (rolling 30 days).
  let resetDays: number | null = null;
  if (profile?.created_at) {
    const created = new Date(profile.created_at).getTime();
    const elapsed = (Date.now() - created) / 86400000;
    resetDays = Math.max(0, Math.ceil(30 - (elapsed % 30)));
  }

  return NextResponse.json({
    tier,
    monthUsed,
    dailyUsed,
    creditsUsed,
    resetDays,
    policy: policyFor(tier),
    credits: INTELLIGENCE_CREDIT_POLICY[tier],
  });
}
