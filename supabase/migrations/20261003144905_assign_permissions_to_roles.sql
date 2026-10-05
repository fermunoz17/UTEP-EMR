-- Assign permissions by stable names rather than numeric IDs.
insert into public.role_permissions (role_id, permission_id)
select r.role_id, p.permission_id
from public.roles r
cross join public.permissions p
where r.role_name = 'pharmacy'
  and p.permission_name in (
    'patient.read',
    'clinical_data.read',
    'allergy.read',
    'problem_list.read',
    'vitals.read',
    'lab.read',
    'imaging.read',
    'encounter.read',
    'encounter.create',
    'clinical_note.read',
    'clinical_note.create',
    'clinical_note.sign_own',
    'clinical_note.amend_own',
    'clinical_note.close_own',
    'medication.read',
    'medication.write',
    'medication.refill',
    'referral.read',
    'referral.create',
    'referral.update',
    'appointment.read',
    'batch_accounts.create'
  );

insert into public.role_permissions (role_id, permission_id)
select r.role_id, p.permission_id
from public.roles r
cross join public.permissions p
where r.role_name = 'nursing'
  and p.permission_name in (
    'patient.read',
    'clinical_data.read',
    'allergy.read',
    'problem_list.read',
    'vitals.read',
    'vitals.write',
    'lab.read',
    'imaging.read',
    'encounter.read',
    'encounter.create',
    'clinical_note.read',
    'clinical_note.create',
    'clinical_note.sign_own',
    'clinical_note.amend_own',
    'clinical_note.close_own',
    'medication.read',
    'medication.administer',
    'referral.read',
    'referral.create',
    'referral.update',
    'appointment.read',
    'inpatient.read',
    'mar.read',
    'mar.write'
  );

insert into public.role_permissions (role_id, permission_id)
select r.role_id, p.permission_id
from public.roles r
cross join public.permissions p
where r.role_name = 'physical_therapy'
  and p.permission_name in (
    'patient.read',
    'clinical_data.read',
    'allergy.read',
    'problem_list.read',
    'vitals.read',
    'lab.read',
    'imaging.read',
    'encounter.read',
    'encounter.create',
    'clinical_note.read',
    'clinical_note.create',
    'clinical_note.sign_own',
    'clinical_note.amend_own',
    'clinical_note.close_own',
    'medication.read',
    'referral.read',
    'referral.create',
    'referral.update',
    'appointment.read',
    'inpatient.read'
  );

insert into public.role_permissions (role_id, permission_id)
select r.role_id, p.permission_id
from public.roles r
cross join public.permissions p
where r.role_name = 'occupational_therapy'
  and p.permission_name in (
    'patient.read',
    'clinical_data.read',
    'allergy.read',
    'problem_list.read',
    'vitals.read',
    'lab.read',
    'imaging.read',
    'encounter.read',
    'encounter.create',
    'clinical_note.read',
    'clinical_note.create',
    'clinical_note.sign_own',
    'clinical_note.amend_own',
    'clinical_note.close_own',
    'medication.read',
    'referral.read',
    'referral.create',
    'referral.update',
    'appointment.read',
    'inpatient.read'
  );

insert into public.role_permissions (role_id, permission_id)
select r.role_id, p.permission_id
from public.roles r
cross join public.permissions p
where r.role_name = 'psychology'
  and p.permission_name in (
    'patient.read',
    'clinical_data.read',
    'allergy.read',
    'problem_list.read',
    'vitals.read',
    'lab.read',
    'imaging.read',
    'encounter.read',
    'encounter.create',
    'clinical_note.read',
    'clinical_note.create',
    'clinical_note.sign_own',
    'clinical_note.amend_own',
    'clinical_note.close_own',
    'behavioral_health.read',
    'psychology_note.read',
    'psychology_note.create',
    'psychiatry_note.read',
    'psychotherapy_note.read',
    'psychotherapy_note.create',
    'medication.read',
    'referral.read',
    'referral.create',
    'referral.update',
    'appointment.read'
  );

insert into public.role_permissions (role_id, permission_id)
select r.role_id, p.permission_id
from public.roles r
cross join public.permissions p
where r.role_name = 'psychiatry'
  and p.permission_name in (
    'patient.read',
    'clinical_data.read',
    'allergy.read',
    'allergy.write',
    'problem_list.read',
    'problem_list.write',
    'vitals.read',
    'vitals.write',
    'lab.read',
    'lab.order',
    'imaging.read',
    'imaging.order',
    'encounter.read',
    'encounter.create',
    'encounter.close',
    'clinical_note.read',
    'clinical_note.create',
    'clinical_note.sign_own',
    'clinical_note.amend_own',
    'clinical_note.close_own',
    'behavioral_health.read',
    'psychology_note.read',
    'psychiatry_note.read',
    'psychiatry_note.create',
    'psychotherapy_note.read',
    'psychotherapy_note.create',
    'medication.read',
    'medication.write',
    'medication.prescribe',
    'medication.prescribe_controlled',
    'medication.refill',
    'referral.read',
    'referral.create',
    'referral.update',
    'appointment.read',
    'inpatient.read'
  );

insert into public.role_permissions (role_id, permission_id)
select r.role_id, p.permission_id
from public.roles r
cross join public.permissions p
where r.role_name = 'speech_language_pathology'
  and p.permission_name in (
    'patient.read',
    'clinical_data.read',
    'allergy.read',
    'problem_list.read',
    'vitals.read',
    'lab.read',
    'imaging.read',
    'encounter.read',
    'encounter.create',
    'clinical_note.read',
    'clinical_note.create',
    'clinical_note.sign_own',
    'clinical_note.amend_own',
    'clinical_note.close_own',
    'medication.read',
    'referral.read',
    'referral.create',
    'referral.update',
    'appointment.read',
    'inpatient.read'
  );

insert into public.role_permissions (role_id, permission_id)
select r.role_id, p.permission_id
from public.roles r
cross join public.permissions p
where r.role_name = 'social_work'
  and p.permission_name in (
    'patient.read',
    'patient.demographics.read',
    'clinical_data.read',
    'allergy.read',
    'problem_list.read',
    'vitals.read',
    'lab.read',
    'imaging.read',
    'encounter.read',
    'encounter.create',
    'clinical_note.read',
    'clinical_note.create',
    'clinical_note.sign_own',
    'clinical_note.amend_own',
    'clinical_note.close_own',
    'medication.read',
    'referral.read',
    'referral.create',
    'referral.update',
    'appointment.read',
    'inpatient.read'
  );

insert into public.role_permissions (role_id, permission_id)
select r.role_id, p.permission_id
from public.roles r
cross join public.permissions p
where r.role_name = 'inpatient_physician'
  and p.permission_name in (
    'patient.read',
    'patient.demographics.read',
    'clinical_data.read',
    'allergy.read',
    'allergy.write',
    'problem_list.read',
    'problem_list.write',
    'vitals.read',
    'vitals.write',
    'lab.read',
    'lab.order',
    'lab.result.write',
    'imaging.read',
    'imaging.order',
    'imaging.result.write',
    'encounter.read',
    'encounter.create',
    'encounter.close',
    'clinical_note.read',
    'clinical_note.create',
    'clinical_note.sign_own',
    'clinical_note.amend_own',
    'clinical_note.close_own',
    'clinical_note.cosign',
    'medication.read',
    'medication.write',
    'medication.prescribe',
    'medication.prescribe_controlled',
    'medication.refill',
    'referral.read',
    'referral.create',
    'referral.update',
    'appointment.read',
    'inpatient.read',
    'inpatient.admit',
    'inpatient.transfer',
    'inpatient.discharge',
    'mar.read'
  );

insert into public.role_permissions (role_id, permission_id)
select r.role_id, p.permission_id
from public.roles r
cross join public.permissions p
where r.role_name = 'front_desk'
  and p.permission_name in (
    'patient.read',
    'patient.create',
    'patient.demographics.read',
    'patient.demographics.write',
    'patient.insurance.read',
    'patient.insurance.write',
    'appointment.read',
    'appointment.create',
    'appointment.update',
    'appointment.cancel'
  );

insert into public.role_permissions (role_id, permission_id)
select r.role_id, p.permission_id
from public.roles r
cross join public.permissions p
where r.role_name = 'admin'
  and p.permission_name in (
    'users.read',
    'users.manage',
    'roles.read',
    'roles.manage',
    'permissions.read',
    'permissions.manage',
    'reporting.read',
    'audit.read'
  );

insert into public.role_permissions (role_id, permission_id)
select r.role_id, p.permission_id
from public.roles r
cross join public.permissions p
where r.role_name = 'biller'
  and p.permission_name in (
    'patient.read',
    'patient.demographics.read',
    'patient.insurance.read',
    'problem_list.read',
    'encounter.read',
    'billing.read',
    'billing.write',
    'billing.code'
  );
