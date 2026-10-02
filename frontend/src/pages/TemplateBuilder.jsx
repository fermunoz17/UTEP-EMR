import { useEffect, useState } from "react";
import {
    getTemplateById,
    getPatientById,
    createTemplate,
    updateTemplate,
} from "../services/instructorService.js";
import TagSelector from "../components/TagSelector.jsx";
import MedicationSelector from "../components/MedicationSelector.jsx";

const EMPTY_FORM = {
    first_name: "",
    last_name: "",
    date_of_birth: "",
    age: "",
    sex: "",
    phone_number: "",
    email: "",
    occupation: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    allergies: [],
    medical_history: [],
    chief_complaint: "",
};

export default function TemplateBuilder({ templateId, patientId, onNavigate }) {
    const isEditing = Boolean(templateId);
    const isFromPatient = Boolean(patientId) && !isEditing;

    const [form, setForm] = useState(EMPTY_FORM);
    const [baseline, setBaseline] = useState([{ key: "", value: "" }]);
    const [loading, setLoading] = useState(isEditing || isFromPatient);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("allergies");
    const [medications, setMedications] = useState([]);

    useEffect(() => {
        if (isEditing) {
            async function loadTemplate() {
                try {
                    const t = await getTemplateById(templateId);
                    setForm({
                        first_name: t.first_name,
                        last_name: t.last_name,
                        date_of_birth: t.date_of_birth ?? "",
                        age: String(t.age),
                        sex: t.sex ?? "",
                        phone_number: t.phone_number ?? "",
                        email: t.email ?? "",
                        occupation: t.occupation ?? "",
                        emergency_contact_name: t.emergency_contact_name ?? "",
                        emergency_contact_phone: t.emergency_contact_phone ?? "",
                        allergies: Array.isArray(t.allergies) ? t.allergies : [],
                        medical_history: Array.isArray(t.medical_history) ? t.medical_history : [],
                        chief_complaint: t.chief_complaint,
                    });
                    
                    if (t.current_medications) {
                        setMedications(Array.isArray(t.current_medications) ? t.current_medications : []);
                    }

                    const entries = Object.entries(t.clinical_baseline ?? {});
                    setBaseline(
                        entries.length > 0
                            ? entries.map(([key, value]) => ({ key, value }))
                            : [{ key: "", value: "" }]
                    );
                } catch (err) {
                    console.error(err);
                    setError("Failed to load template.");
                }
                setLoading(false);
            }
            loadTemplate();
            return;
        }

        if (isFromPatient) {
            async function loadFromPatient() {
                try {
                    const p = await getPatientById(patientId);
                    setForm({
                        first_name: p.first_name,
                        last_name: p.last_name,
                        date_of_birth: p.date_of_birth ?? "",
                        age: String(p.age),
                        sex: p.sex ?? "",
                        phone_number: p.phone_number ?? "",
                        email: p.email ?? "",
                        occupation: p.occupation ?? "",
                        emergency_contact_name: p.emergency_contacts?.[0]?.name ?? "",
                        emergency_contact_phone: p.emergency_contacts?.[0]?.phone ?? "",
                        allergies: Array.isArray(p.allergies) ? p.allergies : [],
                        medical_history: Array.isArray(p.medical_history) ? p.medical_history : [],
                        chief_complaint: p.last_visit_notes ?? "",
                    });
                    
                    if (p.current_medications) {
                        setMedications(Array.isArray(p.current_medications) ? p.current_medications : []);
                    }

                    const baselineRows = [{ key: "", value: "" }];
                    setBaseline(baselineRows);
                } catch (err) {
                    console.error(err);
                    setError("Failed to load patient data.");
                }
                setLoading(false);
            }
            loadFromPatient();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [templateId, patientId]);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleBaselineChange(index, field, value) {
        setBaseline((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    }

    function addBaselineRow() {
        setBaseline((prev) => [...prev, { key: "", value: "" }]);
    }

    function removeBaselineRow(index) {
        setBaseline((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!form.first_name.trim() || !form.last_name.trim() || !form.chief_complaint.trim()) {
            setError("First name, last name, and chief complaint are required.");
            return;
        }
        const age = parseInt(form.age, 10);
        if (isNaN(age) || age < 0 || age > 150) {
            setError("Age must be a number between 0 and 150.");
            return;
        }

        const clinical_baseline = {};
        for (const { key, value } of baseline) {
            const k = key.trim();
            if (k) clinical_baseline[k] = value.trim();
        }

        const payload = {
            first_name: form.first_name.trim(),
            last_name: form.last_name.trim(),
            date_of_birth: form.date_of_birth || null,
            age,
            sex: form.sex || null,
            phone_number: form.phone_number || null,
            email: form.email || null,
            occupation: form.occupation.trim() || null,
            emergency_contact_name: form.emergency_contact_name.trim() || null,
            emergency_contact_phone: form.emergency_contact_phone.trim() || null,
            allergies: form.allergies,
            medical_history: form.medical_history,
            current_medications: medications,
            chief_complaint: form.chief_complaint.trim(),
            clinical_baseline,
        };

        setSubmitting(true);
        try {
            if (isEditing) {
                await updateTemplate(templateId, payload);
            } else {
                await createTemplate(payload);
            }
            onNavigate("instructorCases");
        } catch (err) {
            console.error(err);
            setError("Failed to save template. Please try again.");
        }
        setSubmitting(false);
    }

    if (loading) {
        return (
            <main className="instructor-main">
                <p className="instructor-loading">Loading…</p>
            </main>
        );
    }

    const pageTitle = isEditing ? "Edit Template" : isFromPatient ? "New Template from Patient" : "New Template";

    return (
        <main className="instructor-main">
            <div className="instructor-page-header">
                <div>
                    <p className="section-title">Instructor</p>
                    <h2>{pageTitle}</h2>
                    <p>
                        {isFromPatient
                            ? "Review and adjust the pre-filled patient data, then save as a training template."
                            : "Define a training patient scenario for your students."}
                    </p>
                </div>
                <button
                    className="secondary-action-button"
                    type="button"
                    onClick={() => onNavigate("instructorCases")}
                >
                    ← Back
                </button>
            </div>

            <form className="instructor-form-panel" onSubmit={handleSubmit} noValidate>

                {error && (
                    <p className="form-message form-message-error" role="alert">{error}</p>
                )}

                {/* ── Patient Identity ─────────────────────────── */}
                <div className="instructor-form-section">
                    <h3 className="instructor-form-section-title">Patient Identity</h3>
                    <div className="instructor-form-grid">
                        <div className="student-form-field">
                            <label htmlFor="first_name">First Name <span aria-hidden="true">*</span></label>
                            <input
                                id="first_name"
                                name="first_name"
                                type="text"
                                value={form.first_name}
                                onChange={handleChange}
                                required
                                disabled={isFromPatient || submitting}
                            />
                        </div>

                        <div className="student-form-field">
                            <label htmlFor="last_name">Last Name <span aria-hidden="true">*</span></label>
                            <input
                                id="last_name"
                                name="last_name"
                                type="text"
                                value={form.last_name}
                                onChange={handleChange}
                                required
                                disabled={isFromPatient || submitting}
                            />
                        </div>

                        <div className="student-form-field">
                            <label htmlFor="age">Age <span aria-hidden="true">*</span></label>
                            <input
                                id="age"
                                name="age"
                                type="number"
                                min="0"
                                max="150"
                                value={form.age}
                                onChange={handleChange}
                                required
                                disabled={isFromPatient || submitting}
                            />
                        </div>

                        <div className="student-form-field">
                            <label htmlFor="sex">Sex</label>
                            <input
                                id="sex"
                                name="sex"
                                type="text"
                                value={form.sex}
                                onChange={handleChange}
                                disabled={isFromPatient || submitting}
                            />
                        </div>

                        <div className="student-form-field">
                            <label htmlFor="date_of_birth">Date of Birth</label>
                            <input
                                id="date_of_birth"
                                name="date_of_birth"
                                type="date"
                                value={form.date_of_birth}
                                onChange={handleChange}
                                disabled={isFromPatient || submitting}
                            />
                        </div>

                        <div className="student-form-field">
                            <label htmlFor="phone_number">Phone</label>
                            <input
                                id="phone_number"
                                name="phone_number"
                                type="tel"
                                value={form.phone_number}
                                onChange={handleChange}
                                disabled={isFromPatient || submitting}
                            />
                        </div>

                        <div className="student-form-field">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                disabled={isFromPatient || submitting}
                            />
                        </div>

                        <div className="student-form-field">
                            <label htmlFor="emergency_contact_name">Emergency Contact Name</label>
                            <input
                                id="emergency_contact_name"
                                name="emergency_contact_name"
                                type="text"
                                value={form.emergency_contact_name}
                                onChange={handleChange}
                                disabled={isFromPatient || submitting}
                            />
                        </div>

                        <div className="student-form-field">
                            <label htmlFor="emergency_contact_phone">Emergency Contact Phone</label>
                            <input
                                id="emergency_contact_phone"
                                name="emergency_contact_phone"
                                type="tel"
                                value={form.emergency_contact_phone}
                                onChange={handleChange}
                                disabled={isFromPatient || submitting}
                            />
                        </div>

                        <div className="student-form-field instructor-form-wide">
                            <label htmlFor="occupation">Occupation</label>
                            <input
                                id="occupation"
                                name="occupation"
                                type="text"
                                value={form.occupation}
                                onChange={handleChange}
                                disabled={isFromPatient || submitting}
                            />
                        </div>

                        <div className="student-form-field instructor-form-wide">
                            <label htmlFor="chief_complaint">Chief Complaint <span aria-hidden="true">*</span></label>
                            <textarea
                                id="chief_complaint"
                                name="chief_complaint"
                                rows={3}
                                value={form.chief_complaint}
                                onChange={handleChange}
                                required
                                disabled={submitting}
                                className="instructor-textarea"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Medical Information ────────────────────────── */}
                <div className="instructor-form-section">
                    <h3 className="instructor-form-section-title" style={{ textAlign: "center" }}>Medical Information</h3>
                    <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1rem" }}>
                        <button type="button" onClick={() => setActiveTab("allergies")} style={{ fontWeight: activeTab === "allergies" ? "bold" : "normal" }}>Allergies</button>
                        <button type="button" onClick={() => setActiveTab("history")} style={{ fontWeight: activeTab === "history" ? "bold" : "normal" }}>Medical History</button>
                        <button type="button" onClick={() => setActiveTab("medications")} style={{ fontWeight: activeTab === "medications" ? "bold" : "normal" }}>Medications</button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "0.75rem", flex: 1 }}>
                        {activeTab === "allergies" && (
                            <TagSelector 
                                value={form.allergies} 
                                onChange={(newArr) => setForm({ ...form, allergies: newArr })} 
                                placeholder="Add allergy (press Enter or comma)..." 
                            />
                        )}

                        {activeTab === "history" && (
                            <TagSelector 
                                value={form.medical_history} 
                                onChange={(newArr) => setForm({ ...form, medical_history: newArr })} 
                                placeholder="Add condition (press Enter or comma)..." 
                            />
                        )}

                        {activeTab === "medications" && (
                            <MedicationSelector 
                                value={medications} 
                                onChange={setMedications} 
                            />
                        )}
                    </div>
                </div>

                {/* ── Clinical Baseline ────────────────────────── */}
                <div className="instructor-form-section">
                    <div className="instructor-baseline-header">
                        <div>
                            <h3 className="instructor-form-section-title">Clinical Baseline</h3>
                            <p className="instructor-baseline-hint">
                                Add vitals, labs, history, or any data the student will see (e.g. BP → 140/90).
                            </p>
                        </div>
                        <button
                            className="secondary-action-button"
                            type="button"
                            onClick={addBaselineRow}
                            disabled={submitting}
                        >
                            + Add Row
                        </button>
                    </div>

                    <div className="instructor-baseline-list">
                        {baseline.map((row, i) => (
                            <div key={i} className="instructor-baseline-row">
                                <input
                                    type="text"
                                    placeholder="Label (e.g. BP)"
                                    value={row.key}
                                    onChange={(e) => handleBaselineChange(i, "key", e.target.value)}
                                    disabled={submitting}
                                    className="instructor-baseline-key"
                                    aria-label={`Baseline field label ${i + 1}`}
                                />
                                <input
                                    type="text"
                                    placeholder="Value (e.g. 140/90 mmHg)"
                                    value={row.value}
                                    onChange={(e) => handleBaselineChange(i, "value", e.target.value)}
                                    disabled={submitting}
                                    className="instructor-baseline-value"
                                    aria-label={`Baseline field value ${i + 1}`}
                                />
                                <button
                                    className="instructor-baseline-remove"
                                    type="button"
                                    onClick={() => removeBaselineRow(i)}
                                    disabled={submitting || baseline.length === 1}
                                    aria-label="Remove row"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Actions ──────────────────────────────────── */}
                <div className="student-form-actions">
                    <button
                        className="secondary-action-button"
                        type="button"
                        onClick={() => onNavigate("instructorCases")}
                        disabled={submitting}
                        style={{ marginRight: "0.75rem" }}
                    >
                        Cancel
                    </button>
                    <button
                        className="primary-action-button"
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting
                            ? isEditing ? "Saving…" : "Creating…"
                            : isEditing ? "Save Changes" : "Create Template"}
                    </button>
                </div>
            </form>
        </main>
    );
}
