-- Organizations = tenants
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  plan text not null default 'free',
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

-- Membership links Supabase auth.users to an org
create table organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique(organization_id, user_id)
);

-- One row per pipeline execution
create table pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  product_idea text not null,
  onboarding_data jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  current_agent text,
  langgraph_thread_id text not null,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Every agent's structured + raw markdown output, one row per agent per run
create table agent_outputs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references pipeline_runs(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  agent_name text not null,
  status text not null default 'pending',
  structured_output jsonb,
  markdown_output text,
  storage_path text,
  model_used text,
  input_tokens int,
  output_tokens int,
  cost_usd numeric(10,4),
  duration_ms int,
  error text,
  created_at timestamptz not null default now(),
  unique(run_id, agent_name)
);

-- Human approval gates (Agent 04, Agent 06) — one row per attempt
create table approval_gates (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references pipeline_runs(id) on delete cascade,
  agent_name text not null,
  attempt int not null default 1,
  status text not null default 'pending',
  reviewer_id uuid references auth.users(id),
  reviewer_notes text,
  edited_output jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique(run_id, agent_name, attempt)
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  actor_id uuid references auth.users(id),
  action text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Usage tracking per billing period
create table usage_counters (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null,
  runs_count int not null default 0,
  unique(organization_id, period_start)
);

-- Team invitations
create table invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  email text not null,
  role text not null default 'member',
  invited_by uuid not null references auth.users(id),
  token text not null unique,
  status text not null default 'pending',
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

-- Stripe webhook idempotency
create table processed_stripe_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);

-- Additional org columns for billing
alter table organizations add column if not exists stripe_subscription_id text;
alter table organizations add column if not exists current_period_end timestamptz;
alter table organizations add column if not exists billing_status text default 'active';
alter table organizations add column if not exists branding jsonb default '{}'::jsonb;

-- === RLS ===
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table pipeline_runs enable row level security;
alter table agent_outputs enable row level security;
alter table approval_gates enable row level security;
alter table audit_logs enable row level security;

-- helper: is the caller a member of this org?
create or replace function is_org_member(org_id uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from organization_members
    where organization_id = org_id and user_id = auth.uid()
  );
$$;

create policy org_select on organizations for select using (is_org_member(id));
create policy org_members_select on organization_members for select using (is_org_member(organization_id));

create policy runs_all on pipeline_runs for all
  using (is_org_member(organization_id)) with check (is_org_member(organization_id));

create policy outputs_all on agent_outputs for all
  using (is_org_member(organization_id)) with check (is_org_member(organization_id));

create policy gates_select on approval_gates for select
  using (is_org_member((select organization_id from pipeline_runs where id = run_id)));

create policy audit_select on audit_logs for select using (is_org_member(organization_id));

alter table usage_counters enable row level security;
alter table invitations enable row level security;

create policy usage_select on usage_counters for select using (is_org_member(organization_id));
create policy invitations_all on invitations for all
  using (is_org_member(organization_id)) with check (is_org_member(organization_id));

-- Atomic usage counter increment
create or replace function increment_usage_counter(p_org_id uuid, p_period_start timestamptz, p_period_end timestamptz)
returns void language sql as $$
  insert into usage_counters (organization_id, period_start, period_end, runs_count)
  values (p_org_id, p_period_start, p_period_end, 1)
  on conflict (organization_id, period_start)
  do update set runs_count = usage_counters.runs_count + 1;
$$;
