import { useEffect, useState } from "react";
import {
    getMyAssignedCases,
    startCase,
    saveCaseNotes,
    submitCase,
} from "../services/studentCaseService.js";
import TagSelector from "../components/TagSelector.jsx";

const STATUS_STYLES = {
    "not started":    { background: "#ede9fe", color: "#6d28d9" },
    "in progress":    { background: "#e0f2fe", color: "#0284c7" },
    "pending review": { background: "#fef3c7", color: "#b45309" },
    "completed":      { background: "#ecfdf5", color: "#047857" },
};

const STATUS_LABELS = {
    "not started":    "Assigned",
    "in progress":    "In Progress",
    "pending review": "Submitted",
    "completed":      "Completed",
};

const EDITABLE_STATUSES = ["not started", "in progress"];

export default function StudentCases({ onNavigate }) {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Modal state
    const [activeCase, setActiveCase] = useState(null);
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState("");

    useEffect(() => {
        fetchCases();
    }, []);

    async function fetchCases() {
        setLoading(true);
        try {
            const data = await getMyAssignedCases();
            setCases(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load your cases. Please try again.");
        }
        setLoading(false);
    }

    async function openCase(c) {
        // Auto-start if not yet started
        if (c.encounter_status === "not started") {
            try {
                const updated = await startCase(c.id);
                setCases((prev) => prev.map((x) => x.id === c.id ? updated : x));
                setActiveCase(updated);
            } catch (err) {
                console.error(err);
                setActiveCase(c);
            }
        } else {
            setActiveCase(c);
        }
        setNotes(c.encounter_notes ?? "");
        setModalError("");
    }

    function closeModal() {
        setActiveCase(null);
        setNotes("");
        setModalError("");
    }

    async function handleSaveDraft() {
        setModalError("");
        setSubmitting(true);
        try {
            const updated = await saveCaseNotes(activeCase.id, notes);
            setCases((prev) => prev.map((x) => x.id === activeCase.id ? updated : x));
            setActiveCase(updated);
        } catch (err) {
            console.error(err);
            setModalError("Failed to save notes. Please try again.");
        }
        setSubmitting(false);
    }

    async function handleSubmit() {
        if (!notes.trim()) {
            setModalError("Please add encounter notes before submitting.");
            return;
        }
        setModalError("");
        setSubmitting(true);
        try {
            const updated = await submitCase(activeCase.id, notes);
            setCases((prev) => prev.map((x) => x.id === activeCase.id ? updated : x));
            closeModal();
        } catch (err) {
            console.error(err);
            setModalError("Failed to submit case. Please try again.");
        }
        setSubmitting(false);
    }

    const isEditable = activeCase && EDITABLE_STATUSES.includes(activeCase.encounter_status);

    return (
        <main className="instructor-main">
            <div className="instructor-page-header">
                <div>
                    <p className="section-title">Student</p>
                    <h2>My Cases</h2>
                    <p>Training cases assigned to you by your instructor.</p>
                </div>
            </div>

            {error && (
                <p className="form-message form-message-error" role="alert">{error}</p>
            )}

            <div className="patient-results">
                {loading ? (
                    <p className="instructor-loading">Loading your cases…</p>
                ) : cases.length === 0 ? (
                    <div className="patients-empty-state">
                        <div className="patients-empty-icon" aria-hidden="true">📋</div>
                        <strong>No cases assigned yet</strong>
                        <p>Your instructor has not assigned any training cases to you yet.</p>
                    </div>
                ) : (
                    <div className="patient-table-wrapper">
                        <table className="patient-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Age</th>
                                    <th>Chief Complaint</th>
                                    <th>Status</th>
                                    <th>Assigned</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cases.map((c) => {
                                    const snap = c.patient_snapshot ?? {};
                                    const statusStyle = STATUS_STYLES[c.encounter_status] ?? STATUS_STYLES["not started"];
                                    const actionLabel =
                                        c.encounter_status === "not started" ? "Open Case"
                                        : c.encounter_status === "in progress" ? "Continue"
                                        : "View";
                                    return (
                                        <tr key={c.id} className="instructor-table-row">
                                            <td>
                                                <strong>{snap.first_name ?? "—"} {snap.last_name ?? ""}</strong>
                                                {snap.sex ? <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginLeft: "0.4rem" }}>· {snap.sex}</span> : null}
                                            </td>
                                            <td>{snap.age ?? "—"}</td>
                                            <td className="instructor-complaint-cell">{snap.chief_complaint ?? "—"}</td>
                                            <td>
                                                <span className="instructor-status-badge" style={statusStyle}>
                                                    {STATUS_LABELS[c.encounter_status] ?? c.encounter_status}
                                                </span>
                                            </td>
                                            <td>{new Date(c.assigned_at).toLocaleDateString()}</td>
                                            <td>
                                                <button
                                                    className={`instructor-action-btn ${c.encounter_status === "not started" ? "instructor-action-assign" : "instructor-action-edit"}`}
                                                    type="button"
                                                    onClick={() => openCase(c)}
                                                >
                                                    {actionLabel}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Case Modal ─────────────────────────────────────── */}
            {activeCase && (
                <div style={overlayStyle} onClick={closeModal}>
                    <div style={modalStyle} onClick={(e) => e.stopPropagation()}>

                        {/* Header */}
                        <div className="case-modal-header">
                            <div>
                                <p className="section-title" style={{ margin: 0 }}>Case Encounter</p>
                                <h3 style={{ margin: "0.2rem 0 0" }}>
                                    {activeCase.patient_snapshot?.first_name} {activeCase.patient_snapshot?.last_name}
                                </h3>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <span className="instructor-status-badge"
                                    style={STATUS_STYLES[activeCase.encounter_status] ?? STATUS_STYLES["not started"]}>
                                    {activeCase.encounter_status}
                                </span>
                                <button className="instructor-baseline-remove" type="button"
                                    onClick={closeModal} aria-label="Close"
                                    style={{ width: 32, height: 32, fontSize: "1.2rem" }}>×</button>
                            </div>
                        </div>

                        <div className="case-modal-body">
                            {/* Student Instructions */}
                            {activeCase.patient_snapshot?.student_instructions && (
                                <div className="case-modal-section">
                                    <p className="case-modal-section-label">Instructions</p>
                                    <div className="case-complaint-box">
                                        <p>{activeCase.patient_snapshot.student_instructions}</p>
                                    </div>
                                </div>
                            )}

                            {/* Patient snapshot */}
                            <div className="case-modal-section">
                                <p className="case-modal-section-label">Patient Info</p>
                                <div className="case-info-grid">
                                    {activeCase.patient_snapshot?.age && (
                                        <div className="case-info-item">
                                            <span className="case-info-label">Age</span>
                                            <span>{activeCase.patient_snapshot.age}</span>
                                        </div>
                                    )}
                                    {activeCase.patient_snapshot?.date_of_birth && (
                                        <div className="case-info-item">
                                            <span className="case-info-label">DOB</span>
                                            <span>{activeCase.patient_snapshot.date_of_birth}</span>
                                        </div>
                                    )}
                                    {activeCase.patient_snapshot?.sex && (
                                        <div className="case-info-item">
                                            <span className="case-info-label">Sex</span>
                                            <span>{activeCase.patient_snapshot.sex}</span>
                                        </div>
                                    )}
                                    {activeCase.patient_snapshot?.occupation && (
                                        <div className="case-info-item">
                                            <span className="case-info-label">Occupation</span>
                                            <span>{activeCase.patient_snapshot.occupation}</span>
                                        </div>
                                    )}
                                    {activeCase.patient_snapshot?.phone_number && (
                                        <div className="case-info-item">
                                            <span className="case-info-label">Phone</span>
                                            <span>{activeCase.patient_snapshot.phone_number}</span>
                                        </div>
                                    )}
                                    {activeCase.patient_snapshot?.email && (
                                        <div className="case-info-item">
                                            <span className="case-info-label">Email</span>
                                            <span>{activeCase.patient_snapshot.email}</span>
                                        </div>
                                    )}
                                    {activeCase.patient_snapshot?.emergency_contacts?.[0] && (
                                        <div className="case-info-item">
                                            <span className="case-info-label">Emergency Contact</span>
                                            <span>{activeCase.patient_snapshot.emergency_contacts[0].name} ({activeCase.patient_snapshot.emergency_contacts[0].phone})</span>
                                        </div>
                                    )}
                                </div>
                                {activeCase.patient_snapshot?.chief_complaint && (
                                    <div className="case-complaint-box">
                                        <span className="case-info-label">Chief Complaint</span>
                                        <p>{activeCase.patient_snapshot.chief_complaint}</p>
                                    </div>
                                )}
                            </div>

                            {/* Medical Information */}
                            {(activeCase.patient_snapshot?.allergies?.length > 0 || activeCase.patient_snapshot?.medical_history?.length > 0 || activeCase.patient_snapshot?.current_medications?.length > 0) && (
                                <div className="case-modal-section">
                                    <p className="case-modal-section-label">Medical Information</p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                        {activeCase.patient_snapshot?.allergies?.length > 0 && (
                                            <div>
                                                <span className="case-info-label">Allergies</span>
                                                <TagSelector value={activeCase.patient_snapshot.allergies} readOnly={true} />
                                            </div>
                                        )}
                                        {activeCase.patient_snapshot?.medical_history?.length > 0 && (
                                            <div>
                                                <span className="case-info-label">Medical History</span>
                                                <TagSelector value={activeCase.patient_snapshot.medical_history} readOnly={true} />
                                            </div>
                                        )}
                                        {activeCase.patient_snapshot?.current_medications?.length > 0 && (
                                            <div>
                                                <span className="case-info-label">Medications</span>
                                                <TagSelector value={activeCase.patient_snapshot.current_medications.map(m => `${m.medicine.name} ${m.dosage}${m.medicine.unit} ${m.frequency}x/day`)} readOnly={true} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Clinical baseline */}
                            {activeCase.patient_snapshot?.clinical_baseline &&
                                Object.keys(activeCase.patient_snapshot.clinical_baseline).length > 0 && (
                                <div className="case-modal-section">
                                    <p className="case-modal-section-label">Clinical Baseline</p>
                                    <div className="case-baseline-grid">
                                        {Object.entries(activeCase.patient_snapshot.clinical_baseline).map(([k, v]) => (
                                            <div key={k} className="case-baseline-item">
                                                <span className="case-info-label">{k}</span>
                                                <span>{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Grading Rubric */}
                            {activeCase.patient_snapshot?.expectations_rubric && (
                                <div className="case-modal-section">
                                    <p className="case-modal-section-label">Expectations & Rubric</p>
                                    <div className="case-notes-readonly">
                                        {activeCase.patient_snapshot.expectations_rubric}
                                    </div>
                                </div>
                            )}

                            {/* Instructor feedback — shown after a return for revision */}
                            {activeCase.instructor_feedback && (
                                <div className="case-modal-section">
                                    <p className="case-modal-section-label">Instructor Feedback</p>
                                    <div className="case-notes-readonly">
                                        {activeCase.instructor_feedback}
                                    </div>
                                </div>
                            )}

                            {/* Encounter notes */}
                            <div className="case-modal-section">
                                <p className="case-modal-section-label">Encounter Notes</p>
                                {isEditable ? (
                                    <textarea
                                        className="instructor-textarea"
                                        rows={6}
                                        placeholder="Document your clinical reasoning, findings, assessment, and plan…"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        disabled={submitting}
                                        style={{ width: "100%" }}
                                    />
                                ) : (
                                    <div className="case-notes-readonly">
                                        {activeCase.encounter_notes || <em style={{ color: "var(--text-muted)" }}>No notes recorded.</em>}
                                    </div>
                                )}
                            </div>

                            {modalError && (
                                <p className="form-message form-message-error" role="alert">{modalError}</p>
                            )}
                        </div>

                        {/* Footer actions */}
                        {isEditable && (
                            <div className="case-modal-footer">
                                <button
                                    className="secondary-action-button"
                                    type="button"
                                    onClick={handleSaveDraft}
                                    disabled={submitting}
                                >
                                    {submitting ? "Saving…" : "Save Draft"}
                                </button>
                                <button
                                    className="primary-action-button"
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                >
                                    {submitting ? "Submitting…" : "Submit for Review"}
                                </button>
                            </div>
                        )}

                        {activeCase.encounter_status === "pending review" && (
                            <div className="case-modal-footer">
                                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                    Submitted — waiting for your instructor to review and sign off.
                                </p>
                            </div>
                        )}

                        {activeCase.encounter_status === "completed" && (
                            <div className="case-modal-footer">
                                <p style={{ margin: 0, color: "var(--success-text)", fontSize: "0.85rem", fontWeight: 600 }}>
                                    This case has been signed off by your instructor.
                                </p>
                            </div>
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
    maxWidth: "640px",
    maxHeight: "88vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
};
