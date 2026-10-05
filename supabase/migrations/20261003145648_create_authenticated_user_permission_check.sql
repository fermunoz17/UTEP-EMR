-- Check permissions for the current user through active profiles, roles, and permissions.
create or replace function public.has_permission(
    requested_permission text
)
returns boolean
language sql
stable
-- Use owner privileges to read authorization tables protected by RLS.
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.profiles prof
        join public.profile_roles pr
            on pr.user_id = prof.user_id
        join public.roles r
            on r.role_id = pr.role_id
        join public.role_permissions rp
            on rp.role_id = r.role_id
        join public.permissions p
            on p.permission_id = rp.permission_id
        where prof.user_id = auth.uid()
          and prof.active = true
          and r.active = true
          and p.active = true
          and p.permission_name = requested_permission
    );
$$;

-- Remove default public execution access.
revoke all
on function public.has_permission(text)
from public;

grant execute
on function public.has_permission(text)
to authenticated;
