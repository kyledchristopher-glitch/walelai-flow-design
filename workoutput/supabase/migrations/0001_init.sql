-- WorkOutput initial schema. Run in the Supabase SQL editor or via the CLI.
-- Identity comes from Supabase Auth (auth.users). Everything below is application data.

-- ---------------------------------------------------------------------------
-- profiles: one row per user. tier is written only by the Stripe webhook
-- (service role) or set to 'free' by the signup trigger. Users may read their own.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tier text not null default 'free',
  stripe_customer_id text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
-- No client update/insert policy. tier is server-authoritative.

-- create a profile automatically on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, tier) values (new.id, 'free') on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- kv: replaces the artifact key/value store (sessions, decision blobs, prefs).
-- ---------------------------------------------------------------------------
create table if not exists public.kv (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value text,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);
alter table public.kv enable row level security;
drop policy if exists kv_all_own on public.kv;
create policy kv_all_own on public.kv for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- usage_events: append-only meter for decision, daily_session, and credit.
-- Direct INSERT is revoked from clients; only consume_usage() writes here, so
-- the cap cannot be dodged by withholding inserts.
-- ---------------------------------------------------------------------------
create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('decision','daily_session','credit')),
  created_at timestamptz not null default now()
);
alter table public.usage_events enable row level security;
drop policy if exists usage_select_own on public.usage_events;
create policy usage_select_own on public.usage_events for select using (auth.uid() = user_id);
create index if not exists usage_events_user_kind_time
  on public.usage_events (user_id, kind, created_at desc);

revoke insert on public.usage_events from anon, authenticated;

-- ---------------------------------------------------------------------------
-- consume_usage: atomic check-and-insert. Reads the caller's tier server-side,
-- so the cap is not trusted from the client. Keep the cap numbers in sync with
-- lib/tiers.ts, or replace the CASE blocks with a lookup into a tier_policy table.
-- ---------------------------------------------------------------------------
create or replace function public.consume_usage(p_kind text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_tier text;
  v_cap int;
  v_days int;
  v_used int;
begin
  if auth.uid() is null then
    return jsonb_build_object('allowed', false, 'error', 'unauthenticated');
  end if;

  select tier into v_tier from public.profiles where id = auth.uid();
  v_tier := coalesce(v_tier, 'free');
  v_days := case when p_kind = 'daily_session' then 1 else 30 end;

  v_cap := case
    when p_kind = 'decision' then
      case v_tier when 'free' then 3 when 'starter' then 10 when 'pro' then 30 when 'team' then 30 else 2147483647 end
    when p_kind = 'daily_session' then
      case v_tier when 'free' then 1 when 'starter' then 3 when 'pro' then 5 when 'team' then 3 else 2147483647 end
    else 2147483647
  end;

  select count(*) into v_used
  from public.usage_events
  where user_id = auth.uid() and kind = p_kind
    and created_at >= now() - (v_days || ' days')::interval;

  if v_used >= v_cap then
    return jsonb_build_object('allowed', false, 'used', v_used, 'cap', v_cap);
  end if;

  insert into public.usage_events(user_id, kind) values (auth.uid(), p_kind);
  return jsonb_build_object('allowed', true, 'used', v_used + 1, 'cap', v_cap);
end; $$;

grant execute on function public.consume_usage(text) to authenticated;

-- ---------------------------------------------------------------------------
-- metrics: product funnel events (optional).
-- ---------------------------------------------------------------------------
create table if not exists public.metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event text not null,
  loop text,
  created_at timestamptz not null default now()
);
alter table public.metrics enable row level security;
drop policy if exists metrics_insert_own on public.metrics;
create policy metrics_insert_own on public.metrics for insert with check (auth.uid() = user_id);
drop policy if exists metrics_select_own on public.metrics;
create policy metrics_select_own on public.metrics for select using (auth.uid() = user_id);
