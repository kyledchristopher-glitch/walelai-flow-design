# WorkOutput

Production scaffold for the WorkOutput decision workspace. Next.js (App Router) on Vercel, Supabase for identity and data, Stripe for payments, Anthropic for generation. This repository takes the single-file mock (`components/WorkOutput.jsx`, build v127.0) and gives it real server seams. The guest tier is gone: account creation is required before any use.

This README is the implementation runbook. Work top to bottom. Sections 1 through 5 stand the service up. Section 6 wires the UI component to the real seams. Sections 7 and 8 cover hardening and the dependency-ordered task list.

---

## 1. What was a mock, and what is now real

The mock enforced everything in the browser. Its own comments flagged this with `TODO(server)` markers. Those markers are the seams. Each one now has a home.

| Mock seam (in `WorkOutput.jsx`)                                                                                | New home                                                  | Source of truth                      |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------ |
| Artifact key/value `store`                                                                                     | `lib/store.ts` (Supabase `kv` table)                      | Supabase                             |
| `useEntitlements()` default `"guest"` then `null`                                                              | `lib/entitlements.ts` reading `/api/entitlements`         | Supabase profile                     |
| `setTier("free")` on "create account"                                                                          | Supabase Auth sign-up                                     | Supabase Auth                        |
| `AuthGate` mandatory boot gate                                                                                 | `app/page.tsx` server gate plus `components/AuthGate.tsx` | Supabase Auth                        |
| Decision and daily caps (`ACTIVE_LIMITS`, `canCreateDecision`, `canStartDailySession`)                         | `/api/usage/*` calling `consume_usage` RPC                | Supabase (atomic, server-side)       |
| `TIER_POLICY`, `TIERS`, `FEATURE_MIN`, `has`, `policyFor`, `INTELLIGENCE_CREDIT_POLICY`, `OUTPUT_PLAN_CEILING` | `lib/tiers.ts`                                            | Shared config                        |
| `MODELS`, `modelForTurn`                                                                                       | `lib/models.ts` and `/api/chat`                           | Server route holds the API key       |
| In-artifact fetch to `api.anthropic.com`                                                                       | `/api/chat`                                               | Server, key never reaches the client |
| Pricing upgrade `setTier(p.id)`                                                                                | `/api/stripe/checkout` plus webhook                       | Stripe drives tier                   |
| `recordMetric`                                                                                                 | `lib/metrics.ts` (Supabase `metrics` table)               | Supabase                             |

Principle: the client may show optimistic state, but the database is the gate. Tier is written only by the Stripe webhook or the signup trigger. Usage is written only by `consume_usage`.

---

## 2. Prerequisites

- Node 20 or later, and a package manager (npm, pnpm, or yarn).
- Accounts: GitHub, Vercel, Supabase, Stripe, Anthropic.
- The Stripe CLI for local webhook testing.

---

## 3. Local install and environment

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local` as you complete sections 4 and 5. Never commit it. Variables prefixed `NEXT_PUBLIC_` reach the browser. Everything else is server-only. The service-role key and the Anthropic key must never appear in client code.

Run locally once the env is populated:

```bash
npm run dev
```

### Preview password protection

Every Vercel deployment is protected by middleware-level Basic Auth before the
app or its API routes run. Set these environment variables in Vercel before
deploying:

```bash
PASSWORD_PROTECTION=true
PASSWORD_PROTECTION_USERNAME=<username>
PASSWORD_PROTECTION_PASSWORD=<strong-password>
```

The guard is enabled automatically on Vercel even if `PASSWORD_PROTECTION` is
omitted. If either credential is missing, the deployment returns `503` instead
of serving the app publicly. Set `PASSWORD_PROTECTION=false` only when the
deployment is intentionally ready to be public.

---

## 4. Supabase

1. Create a project. Copy the project URL, the `anon` key, and the `service_role` key into `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
2. Open the SQL editor and run `supabase/migrations/0001_init.sql`. This creates `profiles`, `kv`, `usage_events`, `metrics`, the signup trigger that issues a `free` profile, and the `consume_usage` enforcement function. It also revokes direct insert on `usage_events`, so caps can only be spent through the function.
3. Authentication settings:
   - Set the Site URL to your deployed origin and add `http://localhost:3000` for local work.
   - Add `${SITE}/auth/callback` to the redirect allow list for every environment.
   - Enable Email (magic link). Enable Google if you want OAuth; add the Google client credentials in the provider settings.
4. Confirm Row Level Security is on for all four tables (the migration enables it). A user can read only their own rows. Tier changes are not writable by clients.

Verification: sign in locally with a magic link. A row should appear in `profiles` with `tier = 'free'`.

---

## 5. Stripe

1. Create two recurring products and prices: Starter and Pro. Copy the price IDs into `STRIPE_PRICE_STARTER` and `STRIPE_PRICE_PRO`.
2. Copy the secret key into `STRIPE_SECRET_KEY` and the publishable key into `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Webhook endpoint: `${SITE}/api/stripe/webhook`. Subscribe to `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
4. Local testing:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Use the secret that `stripe listen` prints for local runs.

How tier sync works: checkout sets `client_reference_id` to the Supabase user id. On `checkout.session.completed` the webhook reads the subscription price, maps it to a tier through `PRICE_TO_TIER`, and writes `profiles.tier`. Subscription updates and cancellations resync or downgrade to `free`. The webhook is excluded from middleware so its raw body reaches signature verification intact.

---

## 6. Wire the WorkOutput component to the real seams

`components/WorkOutput.jsx` is the v127.0 mock with `"use client"` and a React import prepended. It still defines its seams inline and still calls the Anthropic API directly. Replace the inline definitions with imports from `lib/`, and point the model call at `/api/chat`. Line numbers are approximate and shift as you edit; grep by symbol.

| Edit         | In `WorkOutput.jsx` (around)                                                                                                                             | Change                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tier config  | `TIER_POLICY` ~3147, `policyFor` ~3160, `INTELLIGENCE_CREDIT_POLICY` ~3170, `OUTPUT_PLAN_CEILING` ~4971, `TIERS` ~9322, `FEATURE_MIN` ~9328, `has` ~9348 | Delete these definitions. Add `import { TIER_POLICY, INTELLIGENCE_CREDIT_POLICY, OUTPUT_PLAN_CEILING, FEATURE_MIN, has, policyFor } from "@/lib/tiers";`. Note `TIERS` is replaced by `TIER_RANK` in `lib/tiers.ts`; `has` already encapsulates rank, so most `TIERS[...]` reads can route through `has`. For the few that read `TIERS[tier].name` or `.color` (the `TierPill` component), add a small `TIER_META` map or inline the label.      |
| Models       | `MODELS` ~2833, `PAID_TIERS` ~2872, `isPaidTier` ~2873, `modelForTurn` ~2874                                                                             | Delete. Add `import { MODELS, modelForTurn } from "@/lib/models";`. Model selection now also happens server-side in `/api/chat`; the client copy is only for any UI that displays the model.                                                                                                                                                                                                                                                     |
| Store        | `const store = {` ~3120                                                                                                                                  | Delete the object. Add `import { store } from "@/lib/store";`. The interface matches (`get`, `set`, `delete`, `list`).                                                                                                                                                                                                                                                                                                                           |
| Entitlements | `function useEntitlements()` ~12639                                                                                                                      | Delete. Add `import { useEntitlements } from "@/lib/entitlements";`. The returned shape matches the call site. `setTier` is now optimistic only.                                                                                                                                                                                                                                                                                                 |
| Model call   | endpoint constant ~2906, the `fetch(...)` that uses it                                                                                                   | Change the endpoint to `"/api/chat"`. Remove the API key and `anthropic-version` headers. Send `{ messages, inferredMode, workflowType, maxTokens, system }`. The response shape is unchanged (`data.content`).                                                                                                                                                                                                                                  |
| Caps         | `ACTIVE_LIMITS` ~3449, `ACTIVE_CREDIT_LIMITS` ~3226, `ACTIVE_DAILY_LIMITS` ~3265, and the consume points in `guardedSend` and `startSeededDecision`      | Replace the read-then-bump pattern with one admission call. At the point where a fresh decision is admitted, call `await consumeUsage("decision")` from `lib/entitlements`; treat `allowed === false` as the cap block (show the upgrade path). For the daily ceiling, call `consumeUsage("daily_session")`. Remove the local `ACTIVE_*` counters; display counts come from `useEntitlements`.                                                   |
| Overage      | `isOverageEnabled` ~3399                                                                                                                                 | Replace with `import { isOverageEnabled } from "@/lib/entitlements";`. It returns `false` until metered billing is built, so caps hold hard.                                                                                                                                                                                                                                                                                                     |
| Auth gate    | `function AuthGate(...)` ~12478, plus the `authGate` modal wiring and the boot gate `if (!tier) return <AuthGate mandatory .../>`                        | The server gate in `app/page.tsx` now blocks unauthenticated users before the component renders, and `components/AuthGate.tsx` performs real sign-in. Delete the in-file `AuthGate` component and the mock `setTier("free")` paths. You can keep the in-file `if (!tier)` gate as a second line of defense; it will render the real `AuthGate` if you import it. Remove `setAuthGate`/`authGate` calls that only existed to prompt guest signup. |
| Metrics      | grep `recordMetric`                                                                                                                                      | Replace the definition with `import { recordMetric } from "@/lib/metrics";`.                                                                                                                                                                                                                                                                                                                                                                     |
| Pricing      | `PricingView` upgrade button (`setTier(p.id)`)                                                                                                           | Call `startCheckout("starter"                                                                                                                                                                                                                                                                                                                                                                                                                    | "pro")`from`lib/entitlements`. On return to `/?upgraded=1`, call the entitlements `refresh()`so the new tier shows. Add a "Manage billing" action that calls`openBillingPortal()`. |

After wiring, the component imports its config and talks to routes. No secret touches the browser.

---

## 7. Enforcement and security notes

- Tier is server-authoritative. The only writers of `profiles.tier` are the signup trigger (`free`) and the Stripe webhook (paid). No client policy allows it.
- Caps are atomic. `consume_usage` checks the count and inserts in one call under `security definer`, and direct insert on `usage_events` is revoked, so a client cannot dodge a cap by withholding an insert or racing two requests.
- Cap numbers are duplicated: once in `lib/tiers.ts` and once in the `consume_usage` CASE blocks. Keep them in sync, or replace the CASE blocks with a lookup into a `tier_policy` table seeded from the same source. This is the one drift risk in the design.
- Turn caps are not yet enforced server-side. If you need them enforced rather than advisory, gate `/api/chat` on a per-decision turn count, or pass a turn counter through `consume_usage`.
- The Anthropic key lives only in `/api/chat`. The service-role key lives only in `lib/supabase/admin.ts`, imported only by server routes. Do not import either into a `"use client"` file.
- Confirm the model strings in `lib/models.ts` against your Anthropic account before launch.

---

## 8. Implementation sequence

Ordered by dependency, not by effort. Each step names its output and the dependency it resolves.

1. Repository and deploy target. Push to GitHub, import into Vercel. Output: a building (not yet functional) deployment. Resolves: hosting and CI. Owner: developer.
2. Supabase project and schema. Create the project, run the migration, set auth providers and redirect URLs, add the three Supabase env vars in Vercel and `.env.local`. Output: working sign-in, auto-created `free` profiles. Resolves: identity and data. Depends on step 1 for the deployed origin.
3. Anthropic key and chat route. Add `ANTHROPIC_API_KEY` and the model env vars. Output: `/api/chat` returns completions for signed-in users. Resolves: generation. Depends on step 2 for auth.
4. Component wiring. Apply Section 6. Output: the UI runs on the real store, entitlements, model route, and metrics. Resolves: the mock-to-service swap. Depends on steps 2 and 3.
5. Stripe products and webhook. Create prices, set the webhook and its secret, add the Stripe env vars. Output: checkout upgrades a profile and the portal manages billing. Resolves: payments and tier sync. Depends on step 2 for the profile to write to.
6. Enforcement hardening. Verify caps under direct API calls, confirm RLS denies cross-user reads, decide on turn-cap enforcement, and resolve the cap-number duplication. Output: caps that hold against a hostile client. Resolves: the remaining client-trust surface. Depends on steps 2, 4, and 5.
7. Production cutover. Set the live Site URL everywhere, switch Stripe to live keys and a live webhook, confirm OAuth redirect URLs, and smoke-test signup, generation, upgrade, and downgrade. Output: launch-ready. Resolves: environment parity. Depends on all prior steps.

Ownership during operation: whoever holds the Supabase service-role key and the Stripe keys owns tier integrity. Treat those two secrets as the crown jewels. Rotate them on staff change.
