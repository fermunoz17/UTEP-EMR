-- Define capabilities assigned through roles.
create table public.permissions (

    permission_id bigint generated always as identity
        primary key,

    permission_name text not null unique,

    category text not null,

    description text,

    active boolean not null default true,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create index idx_permissions_category
    on public.permissions(category);

-- Access policies are defined separately.
alter table public.permissions
enable row level security;
