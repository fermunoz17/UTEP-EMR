begin;

-- We have four tests
select plan(4);

-- --------------------------------------------------
-- Test setup
-- --------------------------------------------------

insert into auth.users (
    id,
    email,
    aud,
    role,
    created_at,
    updated_at
)
values
(
    '11111111-1111-1111-1111-111111111111',
    'student@test.com',
    'authenticated',
    'authenticated',
    now(),
    now()
),
(
    '22222222-2222-2222-2222-222222222222',
    'admin@test.com',
    'authenticated',
    'authenticated',
    now(),
    now()
),
(
    '33333333-3333-3333-3333-333333333333',
    'secondadmin@test.com',
    'authenticated',
    'authenticated',
    now(),
    now()
);

-- Bootstrap two admins for testing
update public.profiles
set account_type = 'admin'
where user_id in (
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333'
);

-- Simulate an authenticated user
set local role authenticated;


-- --------------------------------------------------
-- TEST 1: Student cannot grant admin
-- --------------------------------------------------

select set_config(
    'request.jwt.claim.sub',
    '11111111-1111-1111-1111-111111111111',
    true
);

select throws_ok(
    $$
        select public.grant_admin(
            '11111111-1111-1111-1111-111111111111'
        );
    $$,
    'P0001',
    'Only admins can grant admin access',
    'Student cannot grant admin access'
);


-- --------------------------------------------------
-- TEST 2: Admin can grant admin
-- --------------------------------------------------

select set_config(
    'request.jwt.claim.sub',
    '22222222-2222-2222-2222-222222222222',
    true
);

select lives_ok(
    $$
        select public.grant_admin(
            '11111111-1111-1111-1111-111111111111'
        );
    $$,
    'Admin can grant admin access'
);


-- --------------------------------------------------
-- TEST 3: Admin can remove admin
-- --------------------------------------------------

select lives_ok(
    $$
        select public.remove_admin(
            '11111111-1111-1111-1111-111111111111',
            'student'
        );
    $$,
    'Admin can remove admin access'
);


-- --------------------------------------------------
-- TEST 4: Last admin cannot be removed
-- --------------------------------------------------

-- Remove second admin first
select public.remove_admin(
    '33333333-3333-3333-3333-333333333333',
    'student'
);

-- Only admin@test.com remains as admin
select throws_ok(
    $$
        select public.remove_admin(
            '22222222-2222-2222-2222-222222222222',
            'student'
        );
    $$,
    'P0001',
    'Cannot remove the last active admin',
    'Last active admin cannot be removed'
);


select * from finish();

rollback;
