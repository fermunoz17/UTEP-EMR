import { useState } from "react";
import { createPatient } from "../services/patientService";
import TagSelector from "./TagSelector.jsx";
import MedicationSelector from "./MedicationSelector.jsx";const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  sex: "Male",
  phone_number: "",
  email: "",
  address: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  allergies: [],
  medical_history: []
};

export default function PatientRegistrationForm( {onPatientCreated}){
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("allergies");
    const [medications, setMedications] = useState([]);
    const [error, setError] = useState("");
    const [success, setSucess] = useState("");

    function handleChange(event){
        const {name, value} = event.target;
        setForm((prev) => ({...prev, [name]: value}));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSucess("");
        setSubmitting(true);

        try{

            let allergiesArray = form.allergies || [];
            let medicalHistoryArray = form.medical_history || [];

            let emergencyContact = {
                name: form.emergency_contact_name,
                phone: form.emergency_contact_phone
            };

            const birthDate = new Date(form.date_of_birth);
            const ageDiffMs = Date.now() - birthDate.getTime();
            const calculatedAge = Math.abs(new Date(ageDiffMs).getUTCFullYear() - 1970);

            const patientData = {
                first_name: form.first_name,
                last_name: form.last_name,
                date_of_birth: form.date_of_birth,
                age: calculatedAge,
                sex: form.sex,
                phone_number: form.phone_number,
                email: form.email,
                address: form.address,
                allergies: allergiesArray,
                medical_history: medicalHistoryArray,
                emergency_contacts: [emergencyContact],
                current_medications: medications
            }

            await createPatient(patientData);

            setSucess("Patient created successfully");
            setForm(EMPTY_FORM);
            setMedications([]);

            if (onPatientCreated) onPatientCreated();
        } catch (err){
            setError(err.message);
        } finally{
            setSubmitting(false);
        }
    }

        return (
        <section className="student-form-panel">
            <div className="student-form-heading">
                <h3>Register New Patient</h3>
            </div>

            {error && <p className="form-message form-message-error">{error}</p>}
            {success && <p className="form-message form-message-success">{success}</p>}

            <form className="student-form" onSubmit={handleSubmit}>
                <div className="student-form-grid">
                
                    <div className="student-form-field">
                        <label>First Name</label>
                        <input name="first_name" required value={form.first_name} onChange={handleChange} disabled={submitting} />
                    </div>
                    
                    <div className="student-form-field">
                        <label>Last Name</label>
                        <input name="last_name" required value={form.last_name} onChange={handleChange} disabled={submitting} />
                    </div>
                    
                    <div className="student-form-field">
                        <label>Date of Birth</label>
                        <input name="date_of_birth" type="date" required value={form.date_of_birth} onChange={handleChange} disabled={submitting} />
                    </div>
                    
                    <div className="student-form-field">
                        <label>Sex</label>
                        <select name="sex" value={form.sex} onChange={handleChange} disabled={submitting} style={{ padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db" }}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    <div className="student-form-field">
                        <label>Phone Number</label>
                        <input name="phone_number" value={form.phone_number} onChange={handleChange} disabled={submitting} />
                    </div>
                    
                    <div className="student-form-field">
                        <label>Email</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} disabled={submitting} />
                    </div>

                    <div className="student-form-field">
                        <label>Emergency Contact Name</label>
                        <input name="emergency_contact_name" value={form.emergency_contact_name} onChange={handleChange} disabled={submitting} />
                    </div>
                    
                    <div className="student-form-field">
                        <label>Emergency Contact Phone</label>
                        <input name="emergency_contact_phone" value={form.emergency_contact_phone} onChange={handleChange} disabled={submitting} />
                    </div>

                    <div className="student-form-field student-form-field-wide" style={{ padding: "1rem", border: "1px solid #e0e0e0", borderRadius: "8px", background: "#fcfcfc", marginTop: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1rem", borderBottom: "1px solid #ccc", paddingBottom: "0.5rem" }}>
                            <button type="button" onClick={() => setActiveTab("allergies")} style={activeTab === "allergies" ? activeTabStyle : inactiveTabStyle}>Allergies</button>
                            <button type="button" onClick={() => setActiveTab("history")} style={activeTab === "history" ? activeTabStyle : inactiveTabStyle}>Medical History</button>
                            <button type="button" onClick={() => setActiveTab("medications")} style={activeTab === "medications" ? activeTabStyle : inactiveTabStyle}>Medications</button>
                        </div>

                        {activeTab === "allergies" && (
                            <div>
                                <label>Allergies</label>
                                <TagSelector 
                                    value={form.allergies} 
                                    onChange={(newVal) => setForm({...form, allergies: newVal})} 
                                    placeholder="Add allergy..." 
                                />
                            </div>
                        )}

                        {activeTab === "history" && (
                            <div>
                                <label>Medical History</label>
                                <TagSelector 
                                    value={form.medical_history} 
                                    onChange={(newVal) => setForm({...form, medical_history: newVal})} 
                                    placeholder="Add condition..." 
                                />
                            </div>
                        )}

                        {activeTab === "medications" && (
                            <div>
                                <label>Current Medications</label>
                                <MedicationSelector value={medications} onChange={setMedications} />
                            </div>
                        )}
                    </div>
                
                </div>

                <div className="student-form-actions">
                    <button className="primary-action-button" type="submit" disabled={submitting}>
                        {submitting ? "Registering..." : "Register Patient"}
                    </button>
                </div>
            </form>
        </section>
    );
}

const activeTabStyle = {
    background: "none",
    border: "none",
    borderBottom: "2px solid #0056b3",
    color: "#0056b3",
    fontWeight: "bold",
    cursor: "pointer",
    padding: "0 0 0.25rem 0",
};

const inactiveTabStyle = {
    background: "none",
    border: "none",
    color: "#888",
    cursor: "pointer",
    padding: "0 0 0.25rem 0",
};