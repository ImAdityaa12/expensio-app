create table public.expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  amount decimal not null,
  merchant text not null,
  category text not null,
  date timestamp with time zone default now() not null,
  source text check (source in ('sms', 'manual')) not null,
  note text,
  created_at timestamp with time zone default now() not null
);

alter table public.expenses enable row level security;

create policy "Users can view their own expenses"
  on public.expenses for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own expenses"
  on public.expenses for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own expenses"
  on public.expenses for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own expenses"
  on public.expenses for delete
  using ( auth.uid() = user_id );

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name varchar(255),
  phone_number varchar(20),
  currency varchar(10) default 'INR',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists public.accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  bank_name varchar(255) not null,
  account_name varchar(255) not null,
  last4_digits varchar(4),
  balance decimal(15, 2) default 0,
  created_at timestamp with time zone default now() not null
);

create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name varchar(100) not null,
  icon varchar(50),
  color varchar(20),
  is_default boolean default false,
  created_at timestamp with time zone default now() not null
);

create table if not exists public.category_limits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  limit_amount decimal(15, 2) not null,
  period_type text check (period_type in ('DAILY', 'WEEKLY', 'MONTHLY')) not null,
  start_date date not null,
  end_date date,
  created_at timestamp with time zone default now() not null
);

create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  amount decimal(15, 2) not null,
  type text check (type in ('DEBIT', 'CREDIT')) not null,
  description text,
  merchant_name varchar(255),
  transaction_date timestamp with time zone default now() not null,
  source text check (source in ('SMS', 'MANUAL', 'API')) not null,
  sms_id uuid,
  created_at timestamp with time zone default now() not null
);

create table if not exists public.sms_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  sender varchar(50) not null,
  message text not null,
  received_at timestamp with time zone not null,
  parsed boolean default false,
  confidence_score decimal(3, 2),
  created_at timestamp with time zone default now() not null
);

create table if not exists public.merchant_category_map (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  merchant_keyword varchar(255) not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  unique(user_id, merchant_keyword)
);

create table if not exists public.category_limits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  limit_amount decimal(15, 2) not null,
  period_type text check (period_type in ('DAILY', 'WEEKLY', 'MONTHLY')) not null,
  start_date date not null,
  end_date date,
  created_at timestamp with time zone default now() not null
);

do $$ 
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fk_transactions_sms_logs'
  ) then
    alter table public.transactions 
      add constraint fk_transactions_sms_logs 
      foreign key (sms_id) references public.sms_logs(id) on delete set null;
  end if;
end $$;

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.category_limits enable row level security;
alter table public.transactions enable row level security;
alter table public.sms_logs enable row level security;
alter table public.merchant_category_map enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using ( auth.uid() = id );

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );

drop policy if exists "Users can view their own accounts" on public.accounts;
create policy "Users can view their own accounts"
  on public.accounts for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can insert their own accounts" on public.accounts;
create policy "Users can insert their own accounts"
  on public.accounts for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update their own accounts" on public.accounts;
create policy "Users can update their own accounts"
  on public.accounts for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete their own accounts" on public.accounts;
create policy "Users can delete their own accounts"
  on public.accounts for delete
  using ( auth.uid() = user_id );

drop policy if exists "Users can view their own categories" on public.categories;
create policy "Users can view their own categories"
  on public.categories for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can insert their own categories" on public.categories;
create policy "Users can insert their own categories"
  on public.categories for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update their own categories" on public.categories;
create policy "Users can update their own categories"
  on public.categories for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete their own categories" on public.categories;
create policy "Users can delete their own categories"
  on public.categories for delete
  using ( auth.uid() = user_id );

drop policy if exists "Users can view their own category limits" on public.category_limits;
create policy "Users can view their own category limits"
  on public.category_limits for select
  using ( auth.uid() = user_id );


drop policy if exists "Users can insert their own category limits" on public.category_limits;
create policy "Users can insert their own category limits"
  on public.category_limits for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update their own category limits" on public.category_limits;
create policy "Users can update their own category limits"
  on public.category_limits for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete their own category limits" on public.category_limits;
create policy "Users can delete their own category limits"
  on public.category_limits for delete
  using ( auth.uid() = user_id );

drop policy if exists "Users can view their own transactions" on public.transactions;
create policy "Users can view their own transactions"
  on public.transactions for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can insert their own transactions" on public.transactions;
create policy "Users can insert their own transactions"
  on public.transactions for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update their own transactions" on public.transactions;
create policy "Users can update their own transactions"
  on public.transactions for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete their own transactions" on public.transactions;
create policy "Users can delete their own transactions"
  on public.transactions for delete
  using ( auth.uid() = user_id );

drop policy if exists "Users can view their own SMS logs" on public.sms_logs;
create policy "Users can view their own SMS logs"
  on public.sms_logs for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can insert their own SMS logs" on public.sms_logs;
create policy "Users can insert their own SMS logs"
  on public.sms_logs for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update their own SMS logs" on public.sms_logs;
create policy "Users can update their own SMS logs"
  on public.sms_logs for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can view their own merchant mappings" on public.merchant_category_map;
create policy "Users can view their own merchant mappings"
  on public.merchant_category_map for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can insert their own merchant mappings" on public.merchant_category_map;
create policy "Users can insert their own merchant mappings"
  on public.merchant_category_map for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update their own merchant mappings" on public.merchant_category_map;
create policy "Users can update their own merchant mappings"
  on public.merchant_category_map for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete their own merchant mappings" on public.merchant_category_map;
create policy "Users can delete their own merchant mappings"
  on public.merchant_category_map for delete
  using ( auth.uid() = user_id );

  create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, created_at, updated_at)
  values (new.id, new.raw_user_meta_data->>'name', now(), now())
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create index if not exists idx_profiles_id on public.profiles(id);
create index if not exists idx_accounts_user_id on public.accounts(user_id);
create index if not exists idx_categories_user_id on public.categories(user_id);
create index if not exists idx_category_limits_user_id on public.category_limits(user_id);
create index if not exists idx_category_limits_category_id on public.category_limits(category_id);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_account_id on public.transactions(account_id);
create index if not exists idx_transactions_category_id on public.transactions(category_id);
create index if not exists idx_transactions_date on public.transactions(transaction_date);
create index if not exists idx_sms_logs_user_id on public.sms_logs(user_id);
create index if not exists idx_merchant_map_user_id on public.merchant_category_map(user_id);
create index if not exists idx_merchant_map_keyword on public.merchant_category_map(merchant_keyword);


CREATE INDEX IF NOT EXISTS idx_sms_logs_received_at ON public.sms_logs(received_at);
CREATE INDEX IF NOT EXISTS idx_sms_logs_parsed ON public.sms_logs(parsed);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON public.transactions(source);
CREATE INDEX IF NOT EXISTS idx_transactions_sms_id ON public.transactions(sms_id);

ALTER TABLE public.category_limits ADD CONSTRAINT category_limits_user_id_category_id_unique UNIQUE (user_id, category_id);

DROP POLICY IF EXISTS "Users can view their own category
      limits" ON public.category_limits;
DROP POLICY IF EXISTS "Users can insert their own category
      limits" ON public.category_limits;
DROP POLICY IF EXISTS "Users can update their own category
      limits" ON public.category_limits;
DROP POLICY IF EXISTS "Users can delete their own category
      limits" ON public.category_limits;

CREATE POLICY "Users can manage their own category limits"
ON public.category_limits
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);