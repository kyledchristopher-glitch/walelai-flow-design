import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { modelForTurn } from "@/lib/models";
import { type Tier } from "@/lib/tiers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Server side of the model call. The monolith's in-artifact fetch to api.anthropic.com
// is replaced by a POST to this route, which holds the key and selects the model from the
// authenticated user's tier.
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json();
  const {
    messages,
    inferredMode = "Clarify",
    workflowType = "decide",
    maxTokens = 1200,
    system,
  } = body || {};
  if (!Array.isArray(messages))
    return NextResponse.json({ error: "messages required" }, { status: 400 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier")
    .eq("id", user.id)
    .single();
  const tier = (profile?.tier as Tier) || "free";
  const model = modelForTurn(tier, inferredMode, workflowType);

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, ...(system ? { system } : {}), messages }),
  });

  if (!resp.ok) {
    const detail = await resp.text();
    return NextResponse.json({ error: "model_error", detail }, { status: 502 });
  }
  return NextResponse.json(await resp.json());
}
