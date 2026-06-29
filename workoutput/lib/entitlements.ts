"use client";
import { useCallback, useEffect, useState } from "react";

// Client hook that replaces the monolith's in-file useEntitlements. It reads the
// authoritative tier and usage from /api/entitlements. tier === null means the user is
// not signed in, which drives the mandatory AuthGate. setTier is local optimistic state
// only; real tier changes are written by the Stripe webhook, so call refresh() after a
// checkout returns to resync.
export function useEntitlements() {
  const [tier, setTier] = useState<string | null>(null);
  const [monthUsed, setMonthUsed] = useState(0);
  const [dailyUsed, setDailyUsed] = useState(0);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [resetDays, setResetDays] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/entitlements", { cache: "no-store" });
      const j = await r.json();
      setTier(j.tier ?? null);
      setMonthUsed(j.monthUsed || 0);
      setDailyUsed(j.dailyUsed || 0);
      setCreditsUsed(j.creditsUsed || 0);
      setResetDays(j.resetDays ?? null);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    tier,
    setTier,
    monthUsed,
    setMonthUsed,
    dailyUsed,
    creditsUsed,
    resetDays,
    refreshCredits: refresh,
    refreshDailyUsed: refresh,
    refresh,
    loaded,
  };
}

// Single admission call. Replaces the read-then-bump cap pattern in guardedSend and
// startSeededDecision. Returns { allowed, used, cap }. On allowed === false, show the
// upgrade path. kind is "decision" or "daily_session".
export async function consumeUsage(kind: "decision" | "daily_session") {
  const r = await fetch(`/api/usage/${kind === "decision" ? "decision" : "daily"}`, {
    method: "POST",
  });
  return r.json() as Promise<{ allowed: boolean; used?: number; cap?: number; error?: string }>;
}

// Overage is payment-gated and off until metered billing is wired. Caps hold hard.
export async function isOverageEnabled(): Promise<boolean> {
  return false;
}

export async function startCheckout(tier: "starter" | "pro") {
  const r = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tier }),
  });
  const j = await r.json();
  if (j.url) window.location.href = j.url;
  return j;
}

export async function openBillingPortal() {
  const r = await fetch("/api/stripe/portal", { method: "POST" });
  const j = await r.json();
  if (j.url) window.location.href = j.url;
  return j;
}
