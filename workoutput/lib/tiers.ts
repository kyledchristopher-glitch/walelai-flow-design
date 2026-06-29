// Shared tier configuration. The SERVER is the source of truth for enforcement.
// The client uses these values for display and optimistic UI only. v127 removed the
// guest tier: an unauthenticated user is tier === null and is gated before any use.

export type Tier = "free" | "starter" | "pro" | "team" | "enterprise";

export const TIER_POLICY: Record<
  Tier,
  { maxDecisionsPerMonth: number; maxTurns: number; maxSessionsPerDay: number }
> = {
  free: { maxDecisionsPerMonth: 3, maxTurns: 6, maxSessionsPerDay: 1 },
  starter: { maxDecisionsPerMonth: 10, maxTurns: 10, maxSessionsPerDay: 3 },
  pro: { maxDecisionsPerMonth: 30, maxTurns: 15, maxSessionsPerDay: 5 },
  team: { maxDecisionsPerMonth: 30, maxTurns: 16, maxSessionsPerDay: 3 },
  enterprise: { maxDecisionsPerMonth: Infinity, maxTurns: Infinity, maxSessionsPerDay: Infinity },
};

export const TIER_RANK: Record<Tier, number> = {
  free: 1,
  starter: 2,
  pro: 3,
  team: 4,
  enterprise: 4,
};

export const INTELLIGENCE_CREDIT_POLICY: Record<Tier, { monthlyCredits: number }> = {
  free: { monthlyCredits: 0 },
  starter: { monthlyCredits: 0 },
  pro: { monthlyCredits: 40 },
  team: { monthlyCredits: 40 },
  enterprise: { monthlyCredits: Infinity },
};

export const OUTPUT_PLAN_CEILING: Record<Tier, number> = {
  free: 1200,
  starter: 3000,
  pro: 6000,
  team: 6000,
  enterprise: 8000,
};

export const FEATURE_MIN: Record<string, number> = {
  library: 1,
  profile: 1,
  shareStructure: 1,
  exportMd: 1,
  fullAnalytics: 1,
  upload: 1,
  shareFull: 2,
  exportHtml: 2,
  exportTxt: 2,
  exportPdf: 2,
  advancedTools: 3,
  conflictCheck: 3,
  insights: 3,
  team: 4,
  siteMetrics: 4,
  growthLoops: 4,
};

export function has(tier: Tier | null, feature: string): boolean {
  const rank = tier ? (TIER_RANK[tier] ?? 0) : 0;
  return rank >= (FEATURE_MIN[feature] || 0);
}

export function policyFor(tier: Tier | null) {
  return (tier && TIER_POLICY[tier]) || TIER_POLICY.free;
}
