-- called when new supabase Auth user is created

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    -- create matching profile; Other fields use default
    insert into public.profiles(user_id) values (new.id);
    return new;
end;
$$;

-- Run function on auth user creation
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

