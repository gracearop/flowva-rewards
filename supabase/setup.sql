-- ==========================================
-- 1. TABLES SETUP
-- ==========================================

-- Profiles table (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  current_points integer default 0,
  updated_at timestamp with time zone default now()
);

-- Rewards table (The items users can buy)
create table public.rewards (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text,
  points_cost integer not null,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Transactions table (The audit ledger)
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  reward_id uuid references public.rewards(id),
  points_change integer not null,
  type text not null check (type in ('earned', 'redemption')),
  created_at timestamp with time zone default now()
);

-- ==========================================
-- 2. SECURITY (Row Level Security)
-- ==========================================

alter table public.profiles enable row level security;
alter table public.rewards enable row level security;
alter table public.transactions enable row level security;

-- Policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Rewards are viewable by everyone" on public.rewards for select using (true);
create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);

-- ==========================================
-- 3. FUNCTIONS (The Business Logic)
-- ==========================================

-- Function to handle Point Redemption (Atomic)
create or replace function redeem_reward(reward_id uuid, cost int)
returns void as $$
declare
    user_points int;
begin
    select current_points into user_points from public.profiles where id = auth.uid();

    if user_points < cost then
        raise exception 'Insufficient points balance';
    end if;

    update public.profiles set current_points = current_points - cost where id = auth.uid();

    insert into public.transactions (user_id, reward_id, points_change, type)
    values (auth.uid(), reward_id, -cost, 'redemption');
end;
$$ language plpgsql security definer;

-- Function to handle Earning Points
create or replace function add_points(amount int)
returns void as $$
begin
  update public.profiles set current_points = current_points + amount where id = auth.uid();
  insert into public.transactions (user_id, points_change, type)
  values (auth.uid(), amount, 'earned');
end;
$$ language plpgsql security definer;

-- ==========================================
-- 4. AUTOMATION (Triggers)
-- ==========================================

-- Create profile automatically on Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, current_points)
  values (new.id, new.email, 0);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- 5. DUMMY DATA
-- ==========================================

insert into public.rewards (title, description, image_url, points_cost)
values 
('Free Coffee', 'A hot beverage of your choice.', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500', 500),
('Brand T-Shirt', 'Limited edition cotton tee.', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500', 2500),
('Gift Card', '$20 Amazon Digital Card.', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500', 5000);