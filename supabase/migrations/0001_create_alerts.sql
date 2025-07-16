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