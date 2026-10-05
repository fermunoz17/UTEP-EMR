# Database Seeding Guide

This project includes a seed script located at `frontend/seed.cjs` to quickly populate your local database with test users and sample patient data.

## Prerequisites
The script expects your local Supabase instance to be running.
Ensure you have started Supabase from the root directory:
```bash
npx supabase start
```

## How to Run the Seed Script
Navigate to the `frontend` directory and run the script using Node.js:
```bash
cd frontend
node seed.cjs
```

If successful, you will see output indicating that the test users and patient data have been created.

## Included Test Data
The script automatically generates the following accounts, all with the password **`Test12345`**:
- `admin@test.com` (System Admin)
- `instructor@test.com` (Instructor)
- `student@test.com` (Student)

It also creates a sample patient (John Doe) along with an initial consultation visit and a follow-up appointment.

## How to Update or Add Data
If you want to add more users, patients, or other records, you can modify `frontend/seed.cjs`.

### Adding more users
Locate the `users` array in `seed.cjs`:
```javascript
  const users = [
    { email: 'admin@test.com', firstName: 'System', lastName: 'Admin', role: 'admin' },
    // Add your new user here:
    { email: 'newuser@test.com', firstName: 'New', lastName: 'User', role: 'student' }
  ];
```
The script loops through this array, creates the Supabase Auth user, and updates their public profile automatically.

### Adding more patients or records
Scroll down to the patient creation section. You can duplicate the `supabase.from('patients').insert(...)` blocks to add more records. Ensure that you capture the returned `id` if you plan to link visits or appointments to the new patient:
```javascript
  const { data: newPatient } = await supabase
    .from('patients')
    .insert([{
      first_name: 'Jane',
      last_name: 'Smith',
      age: 30,
      sex: 'Female',
      // ... other fields
    }])
    .select()
    .single();
```

## Note on Credentials
The script uses the default local Supabase `SERVICE_ROLE_KEY`. Because local Supabase environments share the same default JWT secret, this script will work out-of-the-box on any developer's machine as long as they haven't manually changed the `JWT_SECRET` in their Supabase configuration.
