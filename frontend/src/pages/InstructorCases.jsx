import { useEffect, useState } from "react";
import { getMyTemplates, getMyAssignedCases, deleteTemplate, searchPatients, signOffCase, returnCase } from "../services/instructorService.js";
import { getCaseAuditLogs } from "../services/auditService.js";

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

    // Review modal
    const [reviewCase, setReviewCase] = useState(null);
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState("");
    const [feedbackText, setFeedbackText] = useState("");

    // Audit log modal
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditModalOpen, setAuditModalOpen] = useState(false);
    const [auditLoading, setAuditLoading] = useState(false);

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

    function openReview(c) {
        setReviewCase(c);
        setReviewError("");
    }

    function closeReview() {
        setReviewCase(null);
        setReviewError("");
        setFeedbackText("");
    }

    async function openAuditModal(caseId) {
        setAuditModalOpen(true);
        setAuditLoading(true);
        try {
            const logs = await getCaseAuditLogs(caseId);
            setAuditLogs(logs);
        } catch (err) {
            console.error(err);
            setAuditLogs([]);
        }
        setAuditLoading(false);
    }

    function closeAuditModal() {
        setAuditModalOpen(false);
        setAuditLogs([]);
    }

    async function handleSignOff() {
        setReviewSubmitting(true);
        setReviewError("");
        try {
            const updated = await signOffCase(reviewCase.id, feedbackText);
            setCases((prev) => prev.map((c) => c.id === updated.id ? { ...c, encounter_status: updated.encounter_status } : c));
            closeReview();
        } catch (err) {
            console.error(err);
            setReviewError("Failed to sign off case. Please try again.");
        }
        setReviewSubmitting(false);
    }

    async function handleReturn() {
        setReviewSubmitting(true);
        setReviewError("");
        try {
            const updated = await returnCase(reviewCase.id, feedbackText);
            setCases((prev) => prev.map((c) => c.id === updated.id ? { ...c, encounter_status: updated.encounter_status } : c));
            closeReview();
        } catch (err) {
            console.error(err);
            setReviewError("Failed to return case. Please try again.");
        }
        setReviewSubmitting(false);
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
                                        <th>Title</th>
                                        <th>Patient</th>
                                        <th>Year / Discipline</th>
                                        <th>Chief Complaint</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {templates.map((t) => (
                                        <tr key={t.id} className="instructor-table-row">
                                            <td>{t.title || "—"}</td>
                                            <td>{t.first_name} {t.last_name}, {t.age}{t.sex ? ` · ${t.sex}` : ""}</td>
                                            <td>{[t.target_year, t.discipline].filter(Boolean).join(" · ") || "—"}</td>
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
                                        <th>Due Date</th>
                                        <th>Assigned</th>
                                        <th>Action</th>
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
                                                <td>{c.due_date ? new Date(c.due_date).toLocaleDateString() : "—"}</td>
                                                <td>{new Date(c.assigned_at).toLocaleDateString()}</td>
                                                <td>
                                                    <div className="instructor-row-actions">
                                                        {(c.encounter_status === "pending review" || c.encounter_status === "completed") && (
                                                            <button
                                                                className="instructor-action-btn instructor-action-edit"
                                                                type="button"
                                                                onClick={() => openReview(c)}
                                                            >
                                                                {c.encounter_status === "pending review" ? "Review" : "View"}
                                                            </button>
                                                        )}
                                                        <button
                                                            className="instructor-action-btn instructor-action-assign"
                                                            type="button"
                                                            onClick={() => openAuditModal(c.id)}
                                                        >
                                                            Audit Log
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Review Modal ───────────────────────────────────── */}
            {reviewCase && (
                <div style={overlayStyle} onClick={closeReview}>
                    <div style={{ ...modalStyle, maxWidth: "640px", padding: 0 }} onClick={(e) => e.stopPropagation()}>

                        {/* Header */}
                        <div className="case-modal-header">
                            <div>
                                <p className="section-title" style={{ margin: 0 }}>Case Review</p>
                                <h3 style={{ margin: "0.2rem 0 0" }}>
                                    {reviewCase.patient_snapshot?.first_name} {reviewCase.patient_snapshot?.last_name}
                                </h3>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <span className="instructor-status-badge"
                                    style={STATUS_STYLES[reviewCase.encounter_status] ?? STATUS_STYLES["not started"]}>
                                    {reviewCase.encounter_status}
                                </span>
                                <button className="instructor-baseline-remove" type="button"
                                    onClick={closeReview} aria-label="Close"
                                    style={{ width: 32, height: 32, fontSize: "1.2rem" }}>×</button>
                            </div>
                        </div>

                        <div className="case-modal-body">
                            {/* Patient snapshot */}
                            <div className="case-modal-section">
                                <p className="case-modal-section-label">Patient Info</p>
                                <div className="case-info-grid">
                                    {reviewCase.patient_snapshot?.age && (
                                        <div className="case-info-item">
                                            <span className="case-info-label">Age</span>
                                            <span>{reviewCase.patient_snapshot.age}</span>
                                        </div>
                                    )}
                                    {reviewCase.patient_snapshot?.sex && (
                                        <div className="case-info-item">
                                            <span className="case-info-label">Sex</span>
                                            <span>{reviewCase.patient_snapshot.sex}</span>
                                        </div>
                                    )}
                                    {reviewCase.patient_snapshot?.occupation && (
                                        <div className="case-info-item">
                                            <span className="case-info-label">Occupation</span>
                                            <span>{reviewCase.patient_snapshot.occupation}</span>
                                        </div>
                                    )}
                                </div>
                                {reviewCase.patient_snapshot?.chief_complaint && (
                                    <div className="case-complaint-box">
                                        <span className="case-info-label">Chief Complaint</span>
                                        <p>{reviewCase.patient_snapshot.chief_complaint}</p>
                                    </div>
                                )}
                            </div>

                            {/* Clinical baseline */}
                            {reviewCase.patient_snapshot?.clinical_baseline &&
                                Object.keys(reviewCase.patient_snapshot.clinical_baseline).length > 0 && (
                                <div className="case-modal-section">
                                    <p className="case-modal-section-label">Clinical Baseline</p>
                                    <div className="case-baseline-grid">
                                        {Object.entries(reviewCase.patient_snapshot.clinical_baseline).map(([k, v]) => (
                                            <div key={k} className="case-baseline-item">
                                                <span className="case-info-label">{k}</span>
                                                <span>{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Student notes */}
                            <div className="case-modal-section">
                                <p className="case-modal-section-label">Student Encounter Notes</p>
                                <div className="case-notes-readonly">
                                    {reviewCase.encounter_notes || <em style={{ color: "var(--text-muted)" }}>No notes recorded.</em>}
                                </div>
                            </div>

                            {/* Student info */}
                            {reviewCase.profiles && (
                                <div className="case-modal-section">
                                    <p className="case-modal-section-label">Submitted By</p>
                                    <p style={{ margin: 0 }}>
                                        {reviewCase.profiles.first_name} {reviewCase.profiles.last_name}
                                    </p>
                                </div>
                            )}

                            {reviewError && (
                                <p className="form-message form-message-error" role="alert">{reviewError}</p>
                            )}

                            {reviewCase.encounter_status === "pending review" && (
                                <div className="case-modal-section">
                                    <p className="case-modal-section-label">Instructor Feedback</p>
                                    <textarea
                                        className="instructor-feedback-textarea"
                                        placeholder="Enter feedback for the student..."
                                        value={feedbackText}
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                        disabled={reviewSubmitting}
                                        rows={4}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {reviewCase.encounter_status === "pending review" && (
                            <div className="case-modal-footer">
                                <button
                                    className="secondary-action-button"
                                    type="button"
                                    onClick={handleReturn}
                                    disabled={reviewSubmitting}
                                >
                                    {reviewSubmitting ? "Returning…" : "Return for Revision"}
                                </button>
                                <button
                                    className="primary-action-button"
                                    type="button"
                                    onClick={handleSignOff}
                                    disabled={reviewSubmitting}
                                >
                                    {reviewSubmitting ? "Signing…" : "Sign Off"}
                                </button>
                            </div>
                        )}
                        {reviewCase.encounter_status === "completed" && (
                            <div className="case-modal-footer">
                                <p style={{ margin: 0, color: "var(--success-text)", fontSize: "0.85rem", fontWeight: 600 }}>
                                    Signed off — this case is complete.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

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

            {/* ── Audit Log Modal ────────────────────────────────── */}
            {auditModalOpen && (
                <div style={overlayStyle} onClick={closeAuditModal}>
                    <div style={{ ...modalStyle, maxWidth: "640px", padding: 0 }} onClick={(e) => e.stopPropagation()}>

                        <div className="case-modal-header">
                            <div>
                                <p className="section-title" style={{ margin: 0 }}>Case History</p>
                                <h3 style={{ margin: "0.2rem 0 0" }}>Audit Log</h3>
                            </div>
                            <button
                                className="instructor-baseline-remove"
                                type="button"
                                onClick={closeAuditModal}
                                aria-label="Close"
                                style={{ width: 32, height: 32, fontSize: "1.2rem" }}
                            >
                                ×
                            </button>
                        </div>

                        <div className="case-modal-body">
                            {auditLoading ? (
                                <p className="instructor-loading">Loading audit log…</p>
                            ) : auditLogs.length === 0 ? (
                                <p className="instructor-loading">No audit entries for this case yet.</p>
                            ) : (
                                <div className="patient-table-wrapper">
                                    <table className="patient-table">
                                        <thead>
                                            <tr>
                                                <th>When</th>
                                                <th>Actor</th>
                                                <th>Action</th>
                                                <th>Detail</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {auditLogs.map((log) => (
                                                <tr key={log.id} className="instructor-table-row">
                                                    <td style={{ whiteSpace: "nowrap" }}>
                                                        {new Date(log.created_at).toLocaleString()}
                                                    </td>
                                                    <td>
                                                        {log.profiles
                                                            ? `${log.profiles.first_name} ${log.profiles.last_name}`
                                                            : "—"}
                                                    </td>
                                                    <td>
                                                        <span className="instructor-status-badge" style={STATUS_STYLES["in progress"]}>
                                                            {log.action_type.replace(/_/g, " ")}
                                                        </span>
                                                    </td>
                                                    <td className="instructor-complaint-cell">
                                                        {log.new_value ?? log.old_value ?? "—"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
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
