create table alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  coin text not null,
  price numeric,
  funding numeric,
  oi_change numeric,
  recommendation text,
  stop_loss numeric,
  take_profit numeric,
  created_at timestamptz default now()
);

create table alert_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade, -- For multi-user support
  coin text not null,
  enabled boolean default true,
  created_at timestamptz default now()
);

create table logs (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz default now(),
  level text not null,           -- e.g. 'info', 'warn', 'error'
  message text not null,
  coin text,                    -- optional: which coin this relates to
  details jsonb                 -- optional: extra structured data
);