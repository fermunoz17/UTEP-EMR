-- Seed available permissions.
insert into public.permissions (
    permission_name,
    category,
    description
)
values

(
    'patient.read',
    'patient',
    'Identify and open patient records.'
),

(
    'patient.create',
    'patient',
    'Create patient records.'
),

(
    'patient.demographics.read',
    'patient',
    'View patient demographic information.'
),

(
    'patient.demographics.write',
    'patient',
    'Create or update patient demographic information.'
),

(
    'patient.insurance.read',
    'patient',
    'View patient insurance information.'
),

(
    'patient.insurance.write',
    'patient',
    'Create or update patient insurance information.'
),

(
    'clinical_data.read',
    'clinical_data',
    'View general clinical information in the patient record.'
),

(
    'allergy.read',
    'clinical_data',
    'View patient allergies.'
),

(
    'allergy.write',
    'clinical_data',
    'Create or update patient allergies.'
),

(
    'problem_list.read',
    'clinical_data',
    'View the patient problem list.'
),

(
    'problem_list.write',
    'clinical_data',
    'Create or update entries in the patient problem list.'
),

(
    'vitals.read',
    'clinical_data',
    'View patient vital signs.'
),

(
    'vitals.write',
    'clinical_data',
    'Record or update patient vital signs.'
),

(
    'lab.read',
    'laboratory',
    'View laboratory orders and results.'
),

(
    'lab.order',
    'laboratory',
    'Create laboratory orders.'
),

(
    'lab.result.write',
    'laboratory',
    'Enter or upload laboratory results.'
),

(
    'imaging.read',
    'imaging',
    'View imaging orders and results.'
),

(
    'imaging.order',
    'imaging',
    'Create imaging orders.'
),

(
    'imaging.result.write',
    'imaging',
    'Enter or upload imaging results.'
),

(
    'encounter.read',
    'encounter',
    'View patient encounters.'
),

(
    'encounter.create',
    'encounter',
    'Create patient encounters.'
),

(
    'encounter.close',
    'encounter',
    'Close patient encounters when authorized.'
),

(
    'clinical_note.read',
    'clinical_note',
    'View general clinical notes.'
),

(
    'clinical_note.create',
    'clinical_note',
    'Create clinical notes.'
),

(
    'clinical_note.sign_own',
    'clinical_note',
    'Sign clinical notes authored by the current user.'
),

(
    'clinical_note.amend_own',
    'clinical_note',
    'Amend clinical notes authored by the current user.'
),

(
    'clinical_note.close_own',
    'clinical_note',
    'Close clinical notes authored by the current user.'
),

(
    'clinical_note.cosign',
    'clinical_note',
    'Co-sign or attest clinical notes written by another provider or trainee.'
),

(
    'behavioral_health.read',
    'behavioral_health',
    'View authorized behavioral-health clinical information.'
),

(
    'psychology_note.read',
    'behavioral_health',
    'View psychology documentation.'
),

(
    'psychology_note.create',
    'behavioral_health',
    'Create psychology documentation.'
),

(
    'psychiatry_note.read',
    'behavioral_health',
    'View psychiatry documentation.'
),

(
    'psychiatry_note.create',
    'behavioral_health',
    'Create psychiatry documentation.'
),

(
    'psychotherapy_note.read',
    'behavioral_health',
    'View separately restricted psychotherapy notes.'
),

(
    'psychotherapy_note.create',
    'behavioral_health',
    'Create separately restricted psychotherapy notes.'
),

(
    'medication.read',
    'medication',
    'View active medications and medication history.'
),

(
    'medication.write',
    'medication',
    'Add or update medications in the patient record.'
),

(
    'medication.prescribe',
    'medication',
    'Create medication prescriptions.'
),

(
    'medication.prescribe_controlled',
    'medication',
    'Create prescriptions for controlled substances when authorized.'
),

(
    'medication.refill',
    'medication',
    'Create medication renewals or refills.'
),

(
    'medication.administer',
    'medication',
    'Document medication administration.'
),

(
    'referral.read',
    'referral',
    'View referrals available to the user or discipline.'
),

(
    'referral.create',
    'referral',
    'Create referrals to another provider or discipline.'
),

(
    'referral.update',
    'referral',
    'Update referral status and related information.'
),

(
    'appointment.read',
    'scheduling',
    'View patient and provider appointments.'
),

(
    'appointment.create',
    'scheduling',
    'Schedule patient appointments.'
),

(
    'appointment.update',
    'scheduling',
    'Modify patient appointments.'
),

(
    'appointment.cancel',
    'scheduling',
    'Cancel patient appointments.'
),

(
    'inpatient.read',
    'inpatient',
    'View inpatient admission and hospitalization information.'
),

(
    'inpatient.admit',
    'inpatient',
    'Admit a patient.'
),

(
    'inpatient.transfer',
    'inpatient',
    'Transfer an admitted patient between units, rooms, or beds.'
),

(
    'inpatient.discharge',
    'inpatient',
    'Discharge an admitted patient.'
),

(
    'mar.read',
    'inpatient',
    'View the Medication Administration Record.'
),

(
    'mar.write',
    'inpatient',
    'Record medication administration in the Medication Administration Record.'
),

(
    'billing.read',
    'billing',
    'View billing-related encounter information.'
),

(
    'billing.write',
    'billing',
    'Create or update billing information.'
),

(
    'billing.code',
    'billing',
    'Assign ICD-10 and CPT codes.'
),

(
    'users.read',
    'administration',
    'View system user accounts.'
),

(
    'users.manage',
    'administration',
    'Create, activate, deactivate, or modify user accounts.'
),

(
    'roles.read',
    'administration',
    'View system roles and role assignments.'
),

(
    'roles.manage',
    'administration',
    'Create, modify, and assign system roles.'
),

(
    'permissions.read',
    'administration',
    'View system permissions.'
),

(
    'permissions.manage',
    'administration',
    'Manage role permission assignments.'
),

(
    'batch_accounts.create',
    'administration',
    'Create user accounts in bulk.'
),

(
    'reporting.read',
    'reporting',
    'View authorized system reports and analytics.'
),

(
    'audit.read',
    'audit',
    'View authorized system audit records.'
);
