import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ allowed: false, error: "unauthenticated" }, { status: 401 });

  // Atomic check-and-insert in the database. The caller's tier is read server-side,
  // so the cap cannot be spoofed from the client.
  const { data, error } = await supabase.rpc("consume_usage", { p_kind: "decision" });
  if (error) return NextResponse.json({ allowed: false, error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: data?.allowed ? 200 : 402 });
}
