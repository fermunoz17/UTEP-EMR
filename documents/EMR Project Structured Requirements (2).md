# Educational Electronic Medical Record Prototype

## 1. Project Purpose

Develop an electronic medical record (EMR) prototype for educational use. The system is intended to support student learning across health disciplines and may later be considered for broader institutional use if it is successful.

The prototype should reflect how a real medical record works while remaining appropriate for an educational environment. It should support both inpatient and outpatient care workflows and emphasize clinical documentation.

## 2. Scope

The system should be a multidisciplinary EMR with two primary care settings:

- **Inpatient / acute care:** Care delivered while a patient is admitted to a hospital.
- **Outpatient / ambulatory care:** Care delivered when a patient is not admitted, including follow-up and appointment-based care.

A possible interface approach is to provide separate inpatient and outpatient areas or tabs after login.

## 3. Intended Users and Roles

The project should support role-based access for multiple health disciplines and administrative functions. Roles discussed include:

- Family medicine and other medical providers
- Psychiatry and psychology
- Nursing
- Pharmacy
- Physical therapy
- Occupational therapy
- Speech-language pathology
- Social work
- Rehabilitation sciences
- Front desk staff
- Administrators/builders

The system should allow each role to access the functions needed for its discipline. Some areas, such as psychiatric notes, should have stricter access because they contain more sensitive information.

## 4. Access Control and Accounts

The system should include account management and security features suitable for an educational simulation environment.

### Required account features

- Accounts created according to the user’s role.
- A manager or administrator responsible for granting access.
- Optional bulk account creation from a class roster.
- Temporary passwords generated for new accounts.
- Required password change at first login.
- Password-complexity policy.
- Self-service password reset.
- Session timeout after inactivity.
- Optional second verification step after login, similar to Duo.
- Student accounts assigned a role for simulation purposes, such as physician, nurse, or another discipline.

## 5. Patient Management

The EMR should support patient registration, lookup, and record management.

### Patient information

- Registration and demographic information
- Insurance information
- Emergency contact information
- Medical history
- Allergies
- Problem list
- Immunization history
- Current status, including outpatient or currently admitted

### Patient-record functions

- Search for and look up patients
- Identify duplicate patient profiles
- Merge duplicate profiles
- Use test patients for instruction and practice

## 6. Patient Summary Interface

When a user opens a patient record, the system should provide a summary page with key information displayed in sections. Example information discussed includes:

- Most recent visits
- Patient demographics
- Laboratory information and results

Users should be able to navigate between sections or tabs to complete different tasks.

## 7. Clinical Documentation

The system should support encounter-based clinical documentation and discipline-specific note structures.

### Documentation requirements

- One encounter or visit note per outpatient visit.
- Ongoing inpatient documentation, including progress notes, nursing shift notes, and multiple entries per day.
- Discipline-specific note templates.
- A SOAP note format for general medicine:
  - Subjective
  - Objective
  - Assessment
  - Plan
- Different note structures for different disciplines.
- Possible dictation functionality through a microphone feature.
- Ability to disable dictation if needed for instructional purposes.

## 8. Provider Directory and Referrals

The system should contain a provider directory and referral capabilities.

### Provider directory

- List of providers
- Provider disciplines
- Credentials
- Provider schedules

### Referrals

- Ability to create and send referrals in inpatient and outpatient settings.
- Referral tracking.

## 9. Vitals, Labs, Imaging, and Results

The system should support clinical data capture and result management.

### Vitals

- A single vitals snapshot for outpatient care.
- Frequent time-series vital-sign tracking for inpatient care.

### Orders and results

- Laboratory orders.
- Laboratory results through upload.
- Imaging orders.
- Imaging results through upload.
- A laboratory manual or data source containing laboratory types and coding may need to be added.

## 10. Inpatient Features

The inpatient area should include workflows and information not required in the same form for outpatient care.

- Admission workflow
- Bed, unit, and room assignment
- Transfers
- Discharge workflow
- Discharge-summary generation
- Care-team tracking
- Multiple active providers and nurses assigned to a patient
- Inpatient census and occupancy reporting
- Medication Administration Record (MAR)
- Tracking of each medication dose given, including who gave it and when

## 11. Outpatient Features

The outpatient area should support appointment-based care and continuing medication management.

- Appointment-based calendar for providers and patients
- Current medication list
- Prescription record
- Prescription renewal or refill capability
- Prescription capability for users with prescription authority

## 12. Scheduling and Resources

Scheduling requirements differ by care setting.

### Outpatient scheduling

- Appointment-based calendar
- Provider scheduling
- Patient appointment scheduling

### Inpatient scheduling

- Bed, unit, and occupant tracking rather than appointment-based scheduling
- Room and resource scheduling
- Support for participant-specific resources, such as physical therapy equipment

## 13. Medication Management

Medication functionality is a major part of the proposed EMR.

### Medication record functions

- View active medications.
- Add medications.
- Delete medications.
- Refill medications.
- Record prescriptions.
- Electronically send prescriptions to a pharmacy.
- Provide a list of available pharmacies in the area.
- Print a prescription for signature when needed.

### Medication safety checks

The system should provide alerts for:

- Drug–drug interactions
- Medication allergies
- Doses that may be too high
- Duplicate therapy or duplicate prescriptions
- Possible medication interaction issues that could make a drug less effective

### Pharmacogenomics

A desired feature is pharmacogenomic information that can help indicate how a patient may process or respond to particular medications based on genetic data. This information could help prevent prescribing medications that may not work for a patient or may require different handling.

The transcript notes that medication-interaction and drug-information resources could be integrated into the system rather than requiring users to manually enter detailed drug information. Resources mentioned include Lexicomp and Facts & Comparisons, though the discussion indicated these may require subscriptions and that free resources may also exist.

## 14. Billing and Insurance

Billing and insurance can be optional or simplified, but the system should include foundational information needed for educational purposes.

- Record the patient’s insurance type.
- Support basic charge generation.
- Include billing information relevant to services.
- Support selection of CPT or ICD codes.
- The transcript referenced ICD-10 coding and the possibility of uploading a coding manual for code selection based on the patient’s condition or problem.

## 15. Reporting and Export

The system should provide basic reporting and analytics capabilities.

- Volume by provider or discipline
- Inpatient census
- Occupancy reports
- Basic export to CSV
- Basic export to PDF

## 16. Security, Auditability, and Data Integrity

Although the system is an educational prototype and does not need certification, it should be designed with healthcare security and record-integrity concepts in mind.

### Security requirements

- HIPAA-compliant approach or HIPAA-oriented design expectations for the educational system.
- Role-based permissions.
- Restricted access to sensitive records, including psychiatric notes.
- Encryption.
- Audit trails.
- Tracking of who accessed a record.
- Tracking of who changed information and when.

### Data-integrity requirements

- Versioning or record history for clinical records.
- Clinical records should never be hard deleted.
- Visibility into student activity and performance for clinical staff.

## 17. Design Goals and Constraints

The proposed system should feel like a real medical record while remaining usable and flexible for teaching.

Key design goals discussed include:

- Avoid confusing workflows with multiple versions of the same item.
- Make the system user friendly.
- Allow instructors to create and reuse test patient cases.
- Allow flexibility in patient cases and uploaded information.
- Support realistic documentation workflows.
- Support multiple health disciplines in a shared record.
- Keep some advanced capabilities optional if they are not feasible within the prototype, including a patient portal and more complete billing functions.

## 18. Optional or Future Features

The following items were discussed as optional, conditional, or possible later additions:

- Patient portal
- Full billing and insurance workflows
- Advanced pharmacy integration
- Pharmacogenomics support
- Dictation support
- Additional administrative or builder functions
- Expanded role sets for inpatient specialties, such as infectious disease, oncology, and surgery
- Wider institutional deployment after successful educational use
