-- ============================================================
-- HomeFile — Complete Setup
-- Safe to run on a fresh Supabase database.
-- Uses DROP IF EXISTS before every CREATE.
-- ============================================================


-- ============================================================
-- PART 1: DROP TRIGGERS
-- ============================================================

drop trigger if exists on_auth_user_created         on auth.users;
drop trigger if exists update_profiles_updated_at   on profiles;
drop trigger if exists update_homes_updated_at      on homes;
drop trigger if exists update_rooms_updated_at      on rooms;
drop trigger if exists update_appliances_updated_at on appliances;


-- ============================================================
-- PART 2: DROP FUNCTIONS
-- ============================================================

drop function if exists handle_new_user()                        cascade;
drop function if exists update_updated_at_column()               cascade;
drop function if exists get_home_member_role(uuid, uuid)         cascade;
drop function if exists is_home_creator(uuid, uuid)              cascade;


-- ============================================================
-- PART 3: DROP POLICIES — profiles
-- ============================================================

drop policy if exists "Users can read own profile"   on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;


-- ============================================================
-- PART 4: DROP POLICIES — homes
-- ============================================================

drop policy if exists "Home members can read homes"           on homes;
drop policy if exists "Owners can insert homes"               on homes;
drop policy if exists "Owners and managers can update homes"  on homes;
drop policy if exists "Owners can delete homes"               on homes;


-- ============================================================
-- PART 5: DROP POLICIES — home_members (all known names)
-- ============================================================

drop policy if exists "Members can read home_members for their homes" on home_members;
drop policy if exists "Owners can manage home_members"                on home_members;
drop policy if exists "home_members: members can read"                on home_members;
drop policy if exists "home_members: insert"                          on home_members;
drop policy if exists "home_members: owners can update"               on home_members;
drop policy if exists "home_members: owners can delete"               on home_members;


-- ============================================================
-- PART 6: DROP POLICIES — home_member_permissions
-- ============================================================

drop policy if exists "Home members can read permissions"          on home_member_permissions;
drop policy if exists "Owners and managers can manage permissions" on home_member_permissions;


-- ============================================================
-- PART 7: DROP POLICIES — rooms
-- ============================================================

drop policy if exists "Home members can read rooms"           on rooms;
drop policy if exists "Owners and managers can manage rooms"  on rooms;


-- ============================================================
-- PART 8: DROP POLICIES — appliances
-- ============================================================

drop policy if exists "Home members can read appliances"          on appliances;
drop policy if exists "Owners and managers can manage appliances" on appliances;


-- ============================================================
-- PART 9: DROP POLICIES — service_records
-- ============================================================

drop policy if exists "Home members can read service records"          on service_records;
drop policy if exists "Owners and managers can manage service records" on service_records;


-- ============================================================
-- PART 10: DROP POLICIES — documents
-- ============================================================

drop policy if exists "Home members can read documents"          on documents;
drop policy if exists "Owners and managers can manage documents" on documents;


-- ============================================================
-- PART 11: DROP POLICIES — scheduled_tasks
-- ============================================================

drop policy if exists "Home members can read scheduled tasks"          on scheduled_tasks;
drop policy if exists "Owners and managers can manage scheduled tasks" on scheduled_tasks;


-- ============================================================
-- PART 12: DROP TABLES (reverse dependency order)
-- ============================================================

drop table if exists scheduled_tasks          cascade;
drop table if exists documents                cascade;
drop table if exists service_records          cascade;
drop table if exists appliances               cascade;
drop table if exists rooms                    cascade;
drop table if exists home_member_permissions  cascade;
drop table if exists home_members             cascade;
drop table if exists role_templates           cascade;
drop table if exists homes                    cascade;
drop table if exists profiles                 cascade;


-- ============================================================
-- PART 13: EXTENSIONS
-- ============================================================

create extension if not exists "uuid-ossp";


-- ============================================================
-- PART 14: TABLES
-- ============================================================

create table profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text,
  avatar_url  text,
  email       text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create table homes (
  id             uuid default uuid_generate_v4() primary key,
  name           text not null,
  address        text,
  city           text,
  state          text,
  zip            text,
  year_built     integer,
  square_footage integer,
  image_url      text,
  owner_id       uuid references profiles(id) on delete cascade not null,
  created_at     timestamptz default now() not null,
  updated_at     timestamptz default now() not null
);

create table role_templates (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null,
  description text,
  created_at  timestamptz default now() not null
);

insert into role_templates (name, description) values
  ('Owner',       'Full access to all home data and settings'),
  ('Manager',     'Can edit records, manage schedules, and add service history'),
  ('Housekeeper', 'Access to kitchen, bathrooms, and living areas'),
  ('Landscaper',  'Access to outdoor areas and relevant systems'),
  ('Dog Walker',  'Limited access to entry and outdoor areas');

create table home_members (
  id               uuid default uuid_generate_v4() primary key,
  home_id          uuid references homes(id)    on delete cascade not null,
  user_id          uuid references profiles(id) on delete cascade not null,
  role             text not null check (role in ('owner', 'manager', 'limited')),
  role_template_id uuid references role_templates(id),
  invited_by       uuid references profiles(id),
  created_at       timestamptz default now() not null,
  unique(home_id, user_id)
);

create table home_member_permissions (
  id             uuid default uuid_generate_v4() primary key,
  home_member_id uuid references home_members(id) on delete cascade not null,
  category       text not null check (category in (
    'kitchen','living_room','bedroom','bathroom',
    'garage','basement','attic','hvac',
    'electrical','plumbing','outdoor','other'
  )),
  can_view        boolean default true,
  can_edit        boolean default false,
  can_add_records boolean default false,
  unique(home_member_id, category)
);

create table rooms (
  id          uuid default uuid_generate_v4() primary key,
  home_id     uuid references homes(id) on delete cascade not null,
  name        text not null,
  category    text default 'other' check (category in (
    'kitchen','living_room','bedroom','bathroom',
    'garage','basement','attic','hvac',
    'electrical','plumbing','outdoor','other'
  )),
  floor       integer default 1,
  description text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create table appliances (
  id                uuid default uuid_generate_v4() primary key,
  room_id           uuid references rooms(id) on delete cascade not null,
  home_id           uuid references homes(id) on delete cascade not null,
  name              text not null,
  category          text,
  brand             text,
  model             text,
  serial_number     text,
  purchase_date     date,
  installation_date date,
  purchase_price    decimal(10,2),
  warranty_expiry   date,
  warranty_provider text,
  warranty_contact  text,
  notes             text,
  image_url         text,
  created_at        timestamptz default now() not null,
  updated_at        timestamptz default now() not null
);

create table service_records (
  id               uuid default uuid_generate_v4() primary key,
  appliance_id     uuid references appliances(id) on delete cascade not null,
  home_id          uuid references homes(id)      on delete cascade not null,
  service_date     date not null,
  service_type     text not null check (service_type in (
    'maintenance','repair','inspection','replacement','installation'
  )),
  description      text not null,
  cost             decimal(10,2),
  provider         text,
  provider_contact text,
  technician       text,
  notes            text,
  next_service_date date,
  created_at       timestamptz default now() not null,
  created_by       uuid references profiles(id)
);

create table documents (
  id                uuid default uuid_generate_v4() primary key,
  home_id           uuid references homes(id)           on delete cascade not null,
  appliance_id      uuid references appliances(id)      on delete cascade,
  service_record_id uuid references service_records(id) on delete cascade,
  name              text not null,
  file_url          text not null,
  file_type         text,
  file_size         bigint,
  document_type     text check (document_type in (
    'manual','warranty','receipt','inspection','photo','other'
  )),
  description       text,
  created_at        timestamptz default now() not null,
  created_by        uuid references profiles(id)
);

create table scheduled_tasks (
  id                 uuid default uuid_generate_v4() primary key,
  home_id            uuid references homes(id)      on delete cascade not null,
  appliance_id       uuid references appliances(id) on delete cascade,
  title              text not null,
  description        text,
  due_date           date not null,
  priority           text default 'medium' check (priority in ('low','medium','high','urgent')),
  status             text default 'pending' check (status in ('pending','in_progress','completed','dismissed')),
  source             text default 'manual' check (source in ('manual','ai')),
  ai_reasoning       text,
  completed_at       timestamptz,
  completed_by       uuid references profiles(id),
  notify_at_1_month  boolean default true,
  notify_at_1_week   boolean default true,
  notify_at_1_day    boolean default false,
  custom_notify_days integer[],
  recurring          boolean default false,
  recurring_interval integer,
  created_at         timestamptz default now() not null,
  created_by         uuid references profiles(id)
);


-- ============================================================
-- PART 15: SECURITY DEFINER HELPER FUNCTIONS
-- These run as postgres (bypass RLS) to prevent recursion.
-- ============================================================

create or replace function get_home_member_role(home_id_param uuid, user_id_param uuid)
returns text as $$
  select role from home_members
  where home_id = home_id_param and user_id = user_id_param
  limit 1
$$ language sql security definer stable;

create or replace function is_home_creator(home_id_param uuid, user_id_param uuid)
returns boolean as $$
  select exists (
    select 1 from homes where id = home_id_param and owner_id = user_id_param
  )
$$ language sql security definer stable;


-- ============================================================
-- PART 16: ENABLE ROW LEVEL SECURITY
-- ============================================================

alter table profiles                enable row level security;
alter table homes                   enable row level security;
alter table home_members            enable row level security;
alter table home_member_permissions enable row level security;
alter table rooms                   enable row level security;
alter table appliances              enable row level security;
alter table service_records         enable row level security;
alter table documents               enable row level security;
alter table scheduled_tasks         enable row level security;


-- ============================================================
-- PART 17: RLS POLICIES
-- ============================================================

-- ---- profiles ----
create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- ---- homes ----
create policy "Home members can read homes"
  on homes for select using (
    exists (
      select 1 from home_members
      where home_members.home_id = homes.id
        and home_members.user_id = auth.uid()
    )
  );
create policy "Owners can insert homes"
  on homes for insert with check (auth.uid() = owner_id);
create policy "Owners and managers can update homes"
  on homes for update using (
    get_home_member_role(id, auth.uid()) in ('owner', 'manager')
  );
create policy "Owners can delete homes"
  on homes for delete using (auth.uid() = owner_id);

-- ---- home_members ----
-- SELECT: your own row, or any row in a home you belong to
create policy "home_members: members can read"
  on home_members for select using (
    user_id = auth.uid()
    or get_home_member_role(home_id, auth.uid()) is not null
  );
-- INSERT: bootstrap owner row on home creation, OR owner adding a member
create policy "home_members: insert"
  on home_members for insert with check (
    (user_id = auth.uid() and is_home_creator(home_id, auth.uid()))
    or get_home_member_role(home_id, auth.uid()) = 'owner'
  );
-- UPDATE / DELETE: owners only
create policy "home_members: owners can update"
  on home_members for update using (
    get_home_member_role(home_id, auth.uid()) = 'owner'
  );
create policy "home_members: owners can delete"
  on home_members for delete using (
    get_home_member_role(home_id, auth.uid()) = 'owner'
  );

-- ---- home_member_permissions ----
create policy "Home members can read permissions"
  on home_member_permissions for select using (
    exists (
      select 1 from home_members
      where home_members.id = home_member_permissions.home_member_id
        and home_members.user_id = auth.uid()
    )
  );
create policy "Owners and managers can manage permissions"
  on home_member_permissions for all using (
    exists (
      select 1 from home_members hm
      join homes h on h.id = hm.home_id
      where hm.id = home_member_permissions.home_member_id
        and h.owner_id = auth.uid()
    )
  );

-- ---- rooms ----
create policy "Home members can read rooms"
  on rooms for select using (
    get_home_member_role(home_id, auth.uid()) is not null
  );
create policy "Owners and managers can manage rooms"
  on rooms for all using (
    get_home_member_role(home_id, auth.uid()) in ('owner', 'manager')
  );

-- ---- appliances ----
create policy "Home members can read appliances"
  on appliances for select using (
    get_home_member_role(home_id, auth.uid()) is not null
  );
create policy "Owners and managers can manage appliances"
  on appliances for all using (
    get_home_member_role(home_id, auth.uid()) in ('owner', 'manager')
  );

-- ---- service_records ----
create policy "Home members can read service records"
  on service_records for select using (
    get_home_member_role(home_id, auth.uid()) is not null
  );
create policy "Owners and managers can manage service records"
  on service_records for all using (
    get_home_member_role(home_id, auth.uid()) in ('owner', 'manager')
  );

-- ---- documents ----
create policy "Home members can read documents"
  on documents for select using (
    get_home_member_role(home_id, auth.uid()) is not null
  );
create policy "Owners and managers can manage documents"
  on documents for all using (
    get_home_member_role(home_id, auth.uid()) in ('owner', 'manager')
  );

-- ---- scheduled_tasks ----
create policy "Home members can read scheduled tasks"
  on scheduled_tasks for select using (
    get_home_member_role(home_id, auth.uid()) is not null
  );
create policy "Owners and managers can manage scheduled tasks"
  on scheduled_tasks for all using (
    get_home_member_role(home_id, auth.uid()) in ('owner', 'manager')
  );


-- ============================================================
-- PART 18: TRIGGERS
-- ============================================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at_column();
create trigger update_homes_updated_at
  before update on homes
  for each row execute function update_updated_at_column();
create trigger update_rooms_updated_at
  before update on rooms
  for each row execute function update_updated_at_column();
create trigger update_appliances_updated_at
  before update on appliances
  for each row execute function update_updated_at_column();

-- Auto-create profile row on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- ============================================================
-- STORAGE BUCKETS (create manually in Supabase dashboard)
-- ============================================================
-- Storage > New bucket > "documents"   (private)
-- Storage > New bucket > "home-images" (public)
