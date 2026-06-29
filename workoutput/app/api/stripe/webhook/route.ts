import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, PRICE_TO_TIER } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Stripe is the source of truth for tier. This webhook is the only writer of profiles.tier
// on payment events. It uses the service-role client because it has no user session.
export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "no_signature" }, { status: 400 });

  const stripe = getStripe();
  const supabaseAdmin = getSupabaseAdmin();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }

  const setTierByCustomer = async (customerId: string, tier: string) => {
    await supabaseAdmin.from("profiles").update({ tier }).eq("stripe_customer_id", customerId);
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const userId = s.client_reference_id as string | undefined;
      const customerId = s.customer as string;
      if (!s.subscription) {
        return NextResponse.json({ error: "no_subscription" }, { status: 400 });
      }

      const sub = await stripe.subscriptions.retrieve(s.subscription as string);
      const priceId = sub.items.data[0]?.price.id || "";
      const tier = PRICE_TO_TIER[priceId] || "free";
      if (userId) {
        await supabaseAdmin
          .from("profiles")
          .update({ tier, stripe_customer_id: customerId })
          .eq("id", userId);
      } else {
        await setTierByCustomer(customerId, tier);
      }
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const priceId = sub.items.data[0]?.price.id || "";
      const active = sub.status === "active" || sub.status === "trialing";
      await setTierByCustomer(
        sub.customer as string,
        active ? PRICE_TO_TIER[priceId] || "free" : "free",
      );
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await setTierByCustomer(sub.customer as string, "free");
      break;
    }
  }

  return NextResponse.json({ received: true });
}
