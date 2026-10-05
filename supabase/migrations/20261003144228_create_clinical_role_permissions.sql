-- Map roles to permissions without duplicate assignments.
create table public.role_permissions (

    role_permission_id bigint generated always as identity
        primary key,

    role_id bigint not null
        references public.roles(role_id)
        on delete cascade,

    permission_id bigint not null
        references public.permissions(permission_id)
        on delete cascade,

    created_at timestamptz not null default now(),

    unique (role_id, permission_id)
);

create index idx_role_permissions_permission_id
    on public.role_permissions(permission_id);

-- Access policies are defined separately.
alter table public.role_permissions
enable row level security;
