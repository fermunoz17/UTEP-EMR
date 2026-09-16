-- Allows exisitng admin to promote active user to admin
create or replace function public.grant_admin(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin

    -- Allow only admins
    if not public.is_admin() then
        raise exception 'Only admins can grant admin access';
    end if;

    -- promote the requested active user
    update public.profiles
    set account_type = 'admin', updated_at = now()
    where user_id = target_user_id and active = true;

    -- No matching user exists
    if not found then
        raise exception 'Active user not found';
    end if;

end;
$$;

-- Remove default execution access
revoke all on function public.grant_admin(uuid) from public;

-- Allows authenticated users to call function but only admins will have access
grant execute on function public.grant_admin(uuid) to authenticated;

-- Allows an exisitng admin to remove admin access from another user

create or replace function public.remove_admin(target_user_id uuid, new_account_type text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin

    -- allow admins only
    if not public.is_admin() then 
        raise exception 'Only admins can remove admin access';
    end if;

    -- New account type cannot be admin
    if new_account_type is null or new_account_type not in ('student', 'instructor') then
        raise exception 'New account type must be student or instructor';
    end if;

    -- Ensure admin is currently active
    if not exists (
        select 1 from public.profiles
        where user_id = target_user_id and account_type = 'admin' and active = true
    ) then 
        raise exception 'Active admin not found';
    end if;

    -- Prevent removing last admin available
    if (
        select count(*) from public.profiles
        where account_type = 'admin' and active = true
    ) <= 1 then
        raise exception 'Cannot remove the last active admin';
    end if;

    -- Remove admin access
    update public.profiles
    set account_type = new_account_type, updated_at = now()
    where user_id = target_user_id;

end;
$$;

-- Remove default execution access
revoke all on function public.remove_admin(uuid, text) from public;

-- Allows authenticated users to call function but only admins will have access
grant execute on function public.remove_admin(uuid, text) to authenticated;
    
