# UTEP-EMR

> **Note:** The current Supabase implementation uses Supabase Auth for authentication and a `profiles` table linked to `auth.users.id`. If the login implementation requires changes to this structure, coordinate before modifying the shared schema.
> 
> **Initial structure:**
> - `user_id`
> - `first_name`
> - `last_name`
> - `account_type` (`admin`, `instructor`, `student`)
> - `active`
> - `created_at`
> - `updated_at`
> 
> Clinical/simulation roles like physician, nurse, pharmacy, etc. will be kept separate from `account_type`.

---

Educational Electronic Medical Record prototype.

## Supabase Local Setup

This project uses Supabase for authentication and database functionality.

### Requirements
Before starting, make sure you have:
- [Node.js / npm](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Supabase CLI (via `npx`)

### Start Supabase
From the project root, run:
```bash
npx supabase start
```
This starts the local Supabase environment using Docker. After it starts, the terminal will show local URLs including the **API URL**, **Database URL**, and **Supabase Studio URL**.

The Studio URL is usually `http://127.0.0.1:54323`. Open Supabase Studio in your browser to inspect:
- Authentication users
- Database tables
- Table data
- Row Level Security (RLS) settings

### Stop Supabase
When finished working:
```bash
npx supabase stop
```

### Reset the Local Database
To recreate the local database and apply all migrations again:
```bash
npx supabase db reset
```
This command will:
1. Reset the local database
2. Run all files inside `supabase/migrations/`
3. Rebuild the current database structure

> **Warning**: Do not use this command on local data you need to keep, as it will wipe your local database.

### Creating a Migration
Create a new migration with:
```bash
npx supabase migration new <migration_name>
```
**Example:**
```bash
npx supabase migration new create_profiles
```
This creates a SQL file inside `supabase/migrations/`. Database changes should always be added through migrations so the team can easily recreate the exact same database structure.

---

## Current Database Progress

### Profiles Table
A `public.profiles` table has been created with the following fields:
- `user_id` *(references the user's Supabase Auth account)*
- `first_name`
- `last_name`
- `account_type` *(admin, instructor, student)*
- `active`
- `created_at`
- `updated_at`

*Note: Clinical roles such as physician, nurse, pharmacy, etc. will be handled separately from the account type.*

### Automatic Profile Creation
A PostgreSQL trigger currently creates a profile automatically whenever a new Supabase Auth user is created.

**Flow:**  
`New Auth User` -> `auth.users` -> `Database Trigger` -> `public.profiles`

New profiles currently default to:
- `account_type = student`
- `active = true`

---

## Checking Current Progress

### Check Authentication Users
Open Supabase Studio:
1. Go to **Authentication**
2. Click on **Users**

### Check Profiles
Open Supabase Studio:
1. Go to **Table Editor**
2. Select the **public** schema
3. Click on the **profiles** table

*Creating a new Auth user should automatically create a corresponding row in the profiles table.*

### Check Applied Migrations
Migration files are stored in `supabase/migrations/`.

Current migrations include:
- `create_profiles`
- `create_profile_on_signup`
- `add_admin_authorization`
- `add_admin_management`

Running:
```bash
npx supabase db reset
```
is a quick way to verify that all migrations run successfully from a clean database.

### Run Automated Database Tests
Database logic is tested via `pgTAP`. Tests are located in `supabase/tests/`.
To run the test suite:
```bash
npx supabase test db
```

---

## Admin Management Integration

### Current Scope

The current admin-management implementation handles granting and removing
administrator privileges for existing Supabase Auth users.

Creating or deleting Supabase Auth accounts is not implemented here because
account creation overlaps with the login/account-management workflow.

Admin privileges are stored in:
`public.profiles.account_type`

Current account types:
- `student`
- `instructor`
- `admin`

### New Users
Supabase Auth handles user authentication.
When a new user is added to `auth.users`, a database trigger automatically creates the matching row in `public.profiles`.

New profiles default to:
```text
account_type = student
active = true
```
The login/account creation implementation does not need to manually create a profile.

### Grant Admin Access
Use:
```sql
public.grant_admin(target_user_id uuid)
```
Only an active admin can successfully grant admin access.

### Remove Admin Access
Use:
```sql
public.remove_admin(
    target_user_id uuid,
    new_account_type text
)
```
`new_account_type` must be:
- `student`
- `instructor`

The system prevents removal of the final active administrator.

### Admin Security
The database currently enforces:
- Non-admin authenticated users can only read their own profile.
- Admins can read all profiles.
- Normal users cannot directly promote themselves.
- Admin privileges must be changed through the protected functions.
- The last active admin cannot be removed.

---

## Troubleshooting

### Local Port Conflicts
Supabase uses several local ports. If `npx supabase start` reports that a port is already in use, another Supabase project may already be running.

Check running Docker containers:
```bash
docker ps
```
Find containers from another project:
```bash
docker ps --filter "name=PROJECT-NAME"
```
Stop those containers with:
```bash
docker stop $(docker ps -q --filter "name=PROJECT-NAME")
```
*(Stopping the containers does not delete the project's data.)*

---

## Current Admin Management Progress

### Completed
- [x] Supabase local environment initialized
- [x] `profiles` table created
- [x] Profiles linked to `auth.users`
- [x] Default account type set to `student`
- [x] Row Level Security enabled on `profiles`
- [x] Profile automatically created when an Auth user is created
- [x] Admin authorization checks added
- [x] Authorized admins can grant admin access
- [x] Authorized admins can remove admin access
- [x] Users cannot promote themselves directly
- [x] Students can only read their own profile
- [x] Admins can read all profiles
- [x] Final active admin cannot be removed
- [x] Automated `pgTAP` database tests added

### Pending / Integration
- [ ] Determine how the first production admin will be bootstrapped
- [ ] Integrate admin management with the login/account creation flow
- [ ] Add frontend admin-management UI after the frontend platform is chosen