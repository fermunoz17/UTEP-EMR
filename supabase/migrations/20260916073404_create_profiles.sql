-- create table "profiles" on public schema
create table public.profiles(
    -- user_id field; uuid is a data type; unique user id per profile; user_id must correspond to an auth.user; delete if auth.user is deleted
    user_id uuid primary key references auth.users(id) on delete cascade,

    --name fields
    first_name text,
    last_name text,

    --account type (not clinical role, role will be on separate table); must have valid account type value; must be admin, instructor or student for valid
    account_type text not null default 'student' check (account_type in ('admin', 'instructor', 'student')),

    --if account is active
    active boolean not null default true,

    --account creation time; timestamptz is data type
    created_at timestamptz not null default now(),

    --account last updated at; will need logic to update this on changes (not automatically updated unless implemented)
    updated_at timestamptz not null default now()

);

--row level security (will be defined later)
alter table public.profiles enable row level security;