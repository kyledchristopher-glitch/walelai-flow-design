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

  const { data, error } = await supabase.rpc("consume_usage", { p_kind: "daily_session" });
  if (error) return NextResponse.json({ allowed: false, error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: data?.allowed ? 200 : 402 });
}
