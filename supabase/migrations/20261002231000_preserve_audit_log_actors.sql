-- we do not want to erase audit history when an Auth user and their profile are deleted
alter table public.audit_logs
    drop constraint audit_logs_actor_id_fkey;

alter table public.audit_logs
    add constraint audit_logs_actor_id_fkey
    foreign key (actor_id) references public.profiles(user_id) on delete restrict;
