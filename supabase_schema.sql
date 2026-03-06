-- Create tables for the application

-- Materials Table
create table if not exists materials (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text,
  supplier text,
  unit text not null, -- 'kg', 'g', 'ml', 'l', 'un'
  quantity_bought numeric not null default 0,
  price_paid numeric not null default 0,
  unit_cost numeric not null default 0,
  history jsonb default '[]'::jsonb, -- Store price history as JSON array
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid default auth.uid() -- Optional: for multi-user support later
);

-- Indirect Costs Table
create table if not exists indirect_costs (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text not null check (type in ('batch', 'unit')), -- 'batch' or 'unit'
  amount numeric not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid default auth.uid()
);

-- Products Table
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text,
  description text,
  materials jsonb default '[]'::jsonb, -- Store product materials as JSON array
  indirect_costs jsonb default '[]'::jsonb, -- Store product indirect costs as JSON array
  batch_size numeric not null default 1,
  images jsonb default '[]'::jsonb, -- Store base64 images as JSON array
  
  -- Calculated/Stored values
  total_batch_cost numeric not null default 0,
  unit_cost numeric not null default 0,
  
  -- Pricing
  desired_margin_percent numeric not null default 0,
  fixed_profit_addon numeric not null default 0,
  final_price numeric not null default 0,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid default auth.uid()
);

-- Settings Table (Single row per user/app)
create table if not exists settings (
  id uuid default gen_random_uuid() primary key,
  brand_name text,
  subtitle text,
  logo text, -- Base64 or URL
  default_margin_percent numeric default 50,
  default_fixed_cost numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid default auth.uid()
);

-- Enable Row Level Security (RLS)
alter table materials enable row level security;
alter table indirect_costs enable row level security;
alter table products enable row level security;
alter table settings enable row level security;

-- Create policies (Example: Allow public access for now, or authenticated users only)
-- Ideally, you should restrict this to authenticated users.
-- For simplicity in this demo, we'll allow public access if no auth is set up, 
-- BUT standard practice is to use auth.
-- Here is a policy for authenticated users:

create policy "Users can view their own materials" on materials for select using (auth.uid() = user_id);
create policy "Users can insert their own materials" on materials for insert with check (auth.uid() = user_id);
create policy "Users can update their own materials" on materials for update using (auth.uid() = user_id);
create policy "Users can delete their own materials" on materials for delete using (auth.uid() = user_id);

create policy "Users can view their own indirect_costs" on indirect_costs for select using (auth.uid() = user_id);
create policy "Users can insert their own indirect_costs" on indirect_costs for insert with check (auth.uid() = user_id);
create policy "Users can update their own indirect_costs" on indirect_costs for update using (auth.uid() = user_id);
create policy "Users can delete their own indirect_costs" on indirect_costs for delete using (auth.uid() = user_id);

create policy "Users can view their own products" on products for select using (auth.uid() = user_id);
create policy "Users can insert their own products" on products for insert with check (auth.uid() = user_id);
create policy "Users can update their own products" on products for update using (auth.uid() = user_id);
create policy "Users can delete their own products" on products for delete using (auth.uid() = user_id);

create policy "Users can view their own settings" on settings for select using (auth.uid() = user_id);
create policy "Users can insert their own settings" on settings for insert with check (auth.uid() = user_id);
create policy "Users can update their own settings" on settings for update using (auth.uid() = user_id);
create policy "Users can delete their own settings" on settings for delete using (auth.uid() = user_id);

-- If you are not using Auth yet and just want it to work with the anon key for everyone (shared database):
-- create policy "Public access" on materials for all using (true);
-- Repeat for other tables.
