-- an Auth user deletion cascades to profiles. 
-- Keep assigned cases instead of just removing them.
alter table public.assigned_cases
    drop constraint assigned_cases_student_id_fkey;

alter table public.assigned_cases
    add constraint assigned_cases_student_id_fkey
    foreign key (student_id) references public.profiles(user_id) on delete restrict;
