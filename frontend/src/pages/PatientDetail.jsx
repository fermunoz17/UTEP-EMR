import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase.js";
import MedicationSelector from "../components/MedicationSelector.jsx";

export default function PatientDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({});
    const [editMeds, setEditMeds] = useState([]);

    useEffect(() => {
        fetchData();
    }, [id]);

    async function fetchData() {
        setLoading(true);
        const [patientRes, visitsRes] = await Promise.all([
            supabase.from("patients").select("*").eq("id", id).single(),
            supabase.from("visits").select("*").eq("patient_id", id).order("created_at", { ascending: false }),
        ]);

        if (patientRes.error) {
            console.error("Failed to fetch patient:", patientRes.error);
            setError("Patient not found.");
        } else {
            setPatient(patientRes.data);
            setForm(toForm(patientRes.data));
        }

        if (!visitsRes.error) setVisits(visitsRes.data);

        setLoading(false);
    }

    // Keep fetchPatient pointing to fetchData for existing callers
    const fetchPatient = fetchData;

    function toForm(data) {
        return {
            first_name: data.first_name ?? "",
            last_name: data.last_name ?? "",
            age: data.age ?? "",
            occupation: data.occupation ?? "",
            medications: data.medications ?? "",
            last_visit: data.last_visit ?? "",
            last_visit_notes: data.last_visit_notes ?? "",
        };
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        setError("");

        const medicationsText = editMeds.length > 0
            ? editMeds.map((m) => `${m.medicine.name} ${m.dosage}${m.medicine.unit} ${m.frequency}x/day`).join(", ")
            : null;

        const { error } = await supabase
            .from("patients")
            .update({
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                age: parseInt(form.age, 10),
                occupation: form.occupation.trim() || null,
                medications: medicationsText,
                last_visit: form.last_visit || null,
                last_visit_notes: form.last_visit_notes.trim() || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (error) {
            console.error("Failed to save:", error);
            setError("Failed to save changes. Please try again.");
        } else {
            await fetchPatient();
            setEditing(false);
        }

        setSaving(false);
    }

    async function handleDelete() {
        if (!confirm(`Delete ${patient.first_name} ${patient.last_name}? This cannot be undone.`)) return;

        const { error } = await supabase.from("patients").delete().eq("id", id);

        if (error) {
            console.error("Failed to delete:", error);
            setError("Failed to delete patient.");
        } else {
            navigate("/patients");
        }
    }

    if (loading) return <p>Loading patient...</p>;
    if (error && !patient) return <p role="alert">{error}</p>;

    return (
        <main>
            <div className="scaffold-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h1>{patient.first_name} {patient.last_name}</h1>
                    <button onClick={() => navigate("/patients")}>← Back</button>
                </div>

                <p style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#888" }}>
                    ID: {patient.id}
                </p>

                {error && <p role="alert" style={{ color: "red" }}>{error}</p>}

                {editing ? (
                    <form onSubmit={handleSave}>
                        <div style={rowStyle}>
                            <div style={fieldStyle}>
                                <label>First Name</label>
                                <input name="first_name" value={form.first_name} onChange={handleChange} required />
                            </div>
                            <div style={fieldStyle}>
                                <label>Last Name</label>
                                <input name="last_name" value={form.last_name} onChange={handleChange} required />
                            </div>
                        </div>

                        <div style={rowStyle}>
                            <div style={fieldStyle}>
                                <label>Age</label>
                                <input name="age" type="number" min="0" max="150" value={form.age} onChange={handleChange} required />
                            </div>
                            <div style={fieldStyle}>
                                <label>Occupation</label>
                                <input name="occupation" value={form.occupation} onChange={handleChange} />
                            </div>
                        </div>

                        <div style={fieldStyle}>
                            <label>Current Medications</label>
                            <MedicationSelector value={editMeds} onChange={setEditMeds} />
                        </div>

                        <div style={fieldStyle}>
                            <label>Last Visit</label>
                            <input name="last_visit" type="date" value={form.last_visit} onChange={handleChange} />
                        </div>

                        <div style={fieldStyle}>
                            <label>Last Visit Notes</label>
                            <textarea name="last_visit_notes" value={form.last_visit_notes} onChange={handleChange} rows={4} />
                        </div>

                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                            <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                            <button type="button" onClick={() => { setEditing(false); setForm(toForm(patient)); setEditMeds([]); setError(""); }}>Cancel</button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div style={sectionStyle}>
                            <h3>Basic Info</h3>
                            <Detail label="Age" value={patient.age} />
                            <Detail label="Occupation" value={patient.occupation} />
                        </div>

                        <div style={sectionStyle}>
                            <h3>Medical</h3>
                            <Detail
                                label="Current Medications"
                                value={visits.find((v) => v.medications)?.medications}
                            />
                        </div>

                        <div style={sectionStyle}>
                            <h3>Visit History</h3>
                            {visits.length === 0 ? (
                                <p style={{ color: "#aaa" }}>No visits recorded.</p>
                            ) : (
                                visits.map((v) => (
                                    <div key={v.id} style={visitCardStyle}>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <strong>{v.visit_type ?? "Visit"}</strong>
                                            <span style={{ color: "#888", fontSize: "0.85rem" }}>
                                                {new Date(v.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {v.medications && <Detail label="Medications" value={v.medications} />}
                                        {v.notes && <Detail label="Notes" value={v.notes} />}
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
                            <button onClick={() => setEditing(true)}>Edit Patient</button>
                            <button onClick={handleDelete} style={{ color: "red" }}>Delete Patient</button>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}

function Detail({ label, value }) {
    return (
        <div style={{ marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: "bold" }}>{label}: </span>
            <span>{value ?? <em style={{ color: "#aaa" }}>Not set</em>}</span>
        </div>
    );
}

const rowStyle = {
    display: "flex",
    gap: "1rem",
};

const fieldStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    marginBottom: "0.75rem",
    flex: 1,
};

const sectionStyle = {
    marginBottom: "1.5rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid #eee",
};

const visitCardStyle = {
    padding: "0.75rem",
    marginBottom: "0.75rem",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
};
