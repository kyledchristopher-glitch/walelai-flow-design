import Stripe from "stripe";

// apiVersion omitted so the account default applies and types stay aligned with the
// installed stripe package. Pin it once you know your dashboard version.
export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is required");

  return new Stripe(secretKey);
}

export const TIER_TO_PRICE: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
};

export const PRICE_TO_TIER: Record<string, string> = {
  [process.env.STRIPE_PRICE_STARTER || "__starter"]: "starter",
  [process.env.STRIPE_PRICE_PRO || "__pro"]: "pro",
};
