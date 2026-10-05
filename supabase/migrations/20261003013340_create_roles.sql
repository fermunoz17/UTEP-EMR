-- Define roles separately from account types.
create table public.roles (
    role_id bigint generated always as identity primary key,
    role_name text not null unique,
    display_name text not null,
    description text,
    is_clinical boolean not null default true,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Allow multiple roles per user.
create table public.profile_roles (
    profile_role_id bigint generated always as identity
        primary key,

    user_id uuid not null
        references public.profiles(user_id)
        on delete cascade,

    role_id bigint not null
        references public.roles(role_id)
        on delete restrict,

    assigned_at timestamptz not null default now(),

    unique (user_id, role_id)
);

create index idx_profile_roles_user_id
    on public.profile_roles(user_id);

create index idx_profile_roles_role_id
    on public.profile_roles(role_id);

-- Access policies are defined separately.
alter table public.roles enable row level security;

alter table public.profile_roles enable row level security;
