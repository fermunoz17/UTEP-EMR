import { useEffect, useState } from "react";
import { getMyTemplates, getMyAssignedCases, deleteTemplate, searchPatients } from "../services/instructorService.js";

const STATUS_STYLES = {
    "not started":    { background: "#f1f5f9", color: "#64748b" },
    "in progress":    { background: "#e0f2fe", color: "#0284c7" },
    "pending review": { background: "#fef3c7", color: "#b45309" },
    "completed":      { background: "#ecfdf5", color: "#047857" },
};

export default function InstructorCases({ onNavigate }) {
    const [templates, setTemplates] = useState([]);
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Patient picker modal
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerQuery, setPickerQuery] = useState("");
    const [pickerPatients, setPickerPatients] = useState([]);
    const [pickerLoading, setPickerLoading] = useState(false);

    useEffect(() => {
        fetchAll();
    }, []);

    async function fetchAll() {
        setLoading(true);
        setError("");
        try {
            const [tmpl, assigned] = await Promise.all([
                getMyTemplates(),
                getMyAssignedCases(),
            ]);
            setTemplates(tmpl);
            setCases(assigned);
        } catch (err) {
            console.error(err);
            setError("Failed to load data. Please try again.");
        }
        setLoading(false);
    }

    async function handleDelete(templateId, patientName) {
        if (!window.confirm(`Delete template "${patientName}"? This cannot be undone.`)) return;
        try {
            await deleteTemplate(templateId);
            setTemplates((prev) => prev.filter((t) => t.id !== templateId));
        } catch (err) {
            console.error(err);
            alert("Failed to delete template. It may have active assignments.");
        }
    }

    async function openPicker() {
        setPickerOpen(true);
        setPickerQuery("");
        setPickerLoading(true);
        try {
            const patients = await searchPatients("");
            setPickerPatients(patients);
        } catch (err) {
            console.error(err);
        }
        setPickerLoading(false);
    }

    async function handlePickerSearch(e) {
        const q = e.target.value;
        setPickerQuery(q);
        setPickerLoading(true);
        try {
            const patients = await searchPatients(q);
            setPickerPatients(patients);
        } catch (err) {
            console.error(err);
        }
        setPickerLoading(false);
    }

    function handleSelectPatient(patient) {
        setPickerOpen(false);
        onNavigate("templateBuilder", null, { fromPatientId: patient.id });
    }

    return (
        <main className="instructor-main">
            <div className="instructor-page-header">
                <div>
                    <p className="section-title">Instructor</p>
                    <h2>Case Management</h2>
                    <p>Create patient templates and assign training cases to students.</p>
                </div>
            </div>

            {error && (
                <p className="form-message form-message-error" role="alert">{error}</p>
            )}

            {/* ── My Templates ───────────────────────────────────── */}
            <section className="instructor-section">
                <div className="instructor-section-header">
                    <div>
                        <h3>My Templates</h3>
                        <p className="section-description">
                            Reusable patient scenarios you have created.
                        </p>
                    </div>
                    <div className="instructor-row-actions">
                        <button
                            className="secondary-action-button"
                            type="button"
                            onClick={openPicker}
                        >
                            From Patient
                        </button>
                        <button
                            className="primary-action-button"
                            type="button"
                            onClick={() => onNavigate("templateBuilder", null)}
                        >
                            + New Template
                        </button>
                    </div>
                </div>

                <div className="patient-results">
                    {loading ? (
                        <p className="instructor-loading">Loading templates…</p>
                    ) : templates.length === 0 ? (
                        <div className="patients-empty-state">
                            <div className="patients-empty-icon" aria-hidden="true">📋</div>
                            <strong>No templates yet</strong>
                            <p>Create your first patient template to get started.</p>
                        </div>
                    ) : (
                        <div className="patient-table-wrapper">
                            <table className="patient-table">
                                <thead>
                                    <tr>
                                        <th>Patient Name</th>
                                        <th>Age</th>
                                        <th>Sex</th>
                                        <th>Chief Complaint</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {templates.map((t) => (
                                        <tr key={t.id} className="instructor-table-row">
                                            <td>{t.first_name} {t.last_name}</td>
                                            <td>{t.age}</td>
                                            <td>{t.sex || "—"}</td>
                                            <td className="instructor-complaint-cell">{t.chief_complaint}</td>
                                            <td>{new Date(t.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <div className="instructor-row-actions">
                                                    <button
                                                        className="instructor-action-btn instructor-action-edit"
                                                        type="button"
                                                        onClick={() => onNavigate("templateBuilder", t.id)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="instructor-action-btn instructor-action-assign"
                                                        type="button"
                                                        onClick={() => onNavigate("caseAssign", t.id)}
                                                    >
                                                        Assign
                                                    </button>
                                                    <button
                                                        className="instructor-action-btn instructor-action-delete"
                                                        type="button"
                                                        onClick={() => handleDelete(t.id, `${t.first_name} ${t.last_name}`)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Assigned Cases ─────────────────────────────────── */}
            <section className="instructor-section">
                <div className="instructor-section-header">
                    <div>
                        <h3>Assigned Cases</h3>
                        <p className="section-description">
                            All cases assigned to students and their current status.
                        </p>
                    </div>
                </div>

                <div className="patient-results">
                    {loading ? (
                        <p className="instructor-loading">Loading cases…</p>
                    ) : cases.length === 0 ? (
                        <div className="patients-empty-state">
                            <div className="patients-empty-icon" aria-hidden="true">📂</div>
                            <strong>No cases assigned yet</strong>
                            <p>Assign a template to a student to get started.</p>
                        </div>
                    ) : (
                        <div className="patient-table-wrapper">
                            <table className="patient-table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Chief Complaint</th>
                                        <th>Student</th>
                                        <th>Status</th>
                                        <th>Assigned</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cases.map((c) => {
                                        const statusStyle = STATUS_STYLES[c.encounter_status] ?? STATUS_STYLES["not started"];
                                        const patientName = c.patient_templates
                                            ? `${c.patient_templates.first_name} ${c.patient_templates.last_name}`
                                            : "—";
                                        const studentName = c.profiles
                                            ? `${c.profiles.first_name} ${c.profiles.last_name}`
                                            : "—";
                                        return (
                                            <tr key={c.id} className="instructor-table-row">
                                                <td>{patientName}</td>
                                                <td className="instructor-complaint-cell">
                                                    {c.patient_templates?.chief_complaint ?? "—"}
                                                </td>
                                                <td>{studentName}</td>
                                                <td>
                                                    <span className="instructor-status-badge" style={statusStyle}>
                                                        {c.encounter_status}
                                                    </span>
                                                </td>
                                                <td>{new Date(c.assigned_at).toLocaleDateString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Patient Picker Modal ───────────────────────────── */}
            {pickerOpen && (
                <div style={overlayStyle} onClick={() => setPickerOpen(false)}>
                    <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                        <div className="instructor-picker-header">
                            <h3>Select a Patient</h3>
                            <button
                                className="instructor-baseline-remove"
                                type="button"
                                onClick={() => setPickerOpen(false)}
                                aria-label="Close"
                                style={{ width: 32, height: 32, fontSize: "1.2rem" }}
                            >
                                ×
                            </button>
                        </div>

                        <input
                            type="text"
                            placeholder="Search by name…"
                            value={pickerQuery}
                            onChange={handlePickerSearch}
                            className="instructor-search-input"
                            autoFocus
                            style={{ marginBottom: "0.75rem" }}
                        />

                        {pickerLoading ? (
                            <p className="instructor-loading" style={{ padding: "1rem 0" }}>Searching…</p>
                        ) : pickerPatients.length === 0 ? (
                            <p className="instructor-loading" style={{ padding: "1rem 0" }}>No patients found.</p>
                        ) : (
                            <ul className="instructor-student-list">
                                {pickerPatients.map((p) => (
                                    <li key={p.id} className="instructor-student-item">
                                        <button
                                            type="button"
                                            className="instructor-picker-row"
                                            onClick={() => handleSelectPatient(p)}
                                        >
                                            <div className="instructor-picker-name">
                                                {p.first_name} {p.last_name}
                                            </div>
                                            <div className="instructor-picker-meta">
                                                Age {p.age}{p.sex ? ` · ${p.sex}` : ""}{p.occupation ? ` · ${p.occupation}` : ""}
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}

const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
};

const modalStyle = {
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
    width: "100%",
    maxWidth: "500px",
    maxHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    padding: "1.5rem",
    overflow: "hidden",
};
