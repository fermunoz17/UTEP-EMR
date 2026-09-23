const { createClient } = require('@supabase/supabase-js');

// Constants from local supabase setup
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DEFAULT_PASSWORD = 'Test12345';

async function seed() {
  console.log('Seeding database...');

  const users = [
    { email: 'admin@test.com', firstName: 'System', lastName: 'Admin', role: 'admin' },
    { email: 'instructor@test.com', firstName: 'Jane', lastName: 'Instructor', role: 'instructor' },
    { email: 'student@test.com', firstName: 'John', lastName: 'Student', role: 'student' }
  ];

  for (const u of users) {
    console.log(`Creating user ${u.email}...`);
    // 1. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: u.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true
    });

    if (authError) {
      if (authError.message.includes('User already registered')) {
        console.log(`User ${u.email} already exists.`);
        // Note: For a robust script, we might want to fetch the existing user id here to update profile
      } else {
        console.error(`Error creating ${u.email}:`, authError.message);
      }
      continue;
    }

    const userId = authData.user.id;

    // 2. Update Profile with Roles and Names
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: u.firstName,
        last_name: u.lastName,
        account_type: u.role
      })
      .eq('user_id', userId);

    if (profileError) {
      console.error(`Error updating profile for ${u.email}:`, profileError.message);
    } else {
      console.log(`Profile updated for ${u.email}.`);
    }
  }

  // Seed sample patient
  console.log('Creating sample patient...');
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .insert([
      {
        first_name: 'John',
        last_name: 'Doe',
        age: 45,
        sex: 'Male',
        occupation: 'Software Engineer',
        medications: 'Lisinopril 10mg daily',
        last_visit: '2026-09-01',
        last_visit_notes: 'Patient complained of mild headaches.'
      }
    ])
    .select()
    .single();

  if (patientError) {
    console.error('Error creating patient:', patientError.message);
  } else {
    console.log('Sample patient created with ID:', patient.id);

    // Seed sample visit
    console.log('Creating sample visit...');
    const { error: visitError } = await supabase
      .from('visits')
      .insert([
        {
          patient_id: patient.id,
          visit_type: 'Initial Consultation',
          notes: 'Patient discussed ongoing back pain and requested physical therapy referral.',
          medications: 'Ibuprofen as needed'
        }
      ]);

    if (visitError) console.error('Error creating visit:', visitError.message);
    else console.log('Sample visit created.');

    // Seed sample appointment
    console.log('Creating sample appointment...');
    const { error: apptError } = await supabase
      .from('appointments')
      .insert([
        {
          patient_id: patient.id,
          appointment_type: 'Follow-up',
          scheduled_date: '2026-10-15',
          scheduled_time: '14:30:00',
          notes: 'Check progress on back pain therapy.',
          status: 'scheduled'
        }
      ]);

    if (apptError) console.error('Error creating appointment:', apptError.message);
    else console.log('Sample appointment created.');
  }

  console.log('Seeding complete!');
}

seed().catch(err => console.error('Unexpected error:', err));
