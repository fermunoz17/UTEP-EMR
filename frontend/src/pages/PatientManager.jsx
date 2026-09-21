import { useEffect, useState } from "react";
import { supabase } from "../supabase.js";

export default function PatientManager({ onNavigate }) {
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ first_name: "", last_name: "", age: "", sex: "" });

    const filtered = patients.filter((p) => {
        const q = search.toLowerCase();
        return (
            p.id.toLowerCase().includes(q) ||
            p.first_name.toLowerCase().includes(q) ||
            p.last_name.toLowerCase().includes(q) ||
            String(p.age).includes(q)
        );
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    async function fetchPatients() {
        setLoading(true);
        const { data, error } = await supabase
            .from("patients")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Failed to fetch patients:", error);
        } else {
            setPatients(data);
        }
        setLoading(false);
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError("");
        setSubmitting(true);

        const { error } = await supabase.from("patients").insert({
            first_name: form.first_name.trim(),
            last_name: form.last_name.trim(),
            age: parseInt(form.age, 10),
            sex: form.sex || null,
        });

        if (error) {
            console.error("Failed to add patient:", error);
            setFormError("Failed to add patient. Please try again.");
        } else {
            setForm({ first_name: "", last_name: "", age: "", sex: "" });
            setShowModal(false);
            await fetchPatients();
        }

        setSubmitting(false);
    }

    function handleCloseModal() {
        setShowModal(false);
        setForm({ first_name: "", last_name: "", age: "", sex: "" });
        setFormError("");
    }

    return (
        <main>
            <div className="scaffold-card">
                <h1>Patient Manager</h1>

                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                    <button onClick={() => setShowModal(true)}>
                        + Add Patient
                    </button>
                    <button onClick={() => onNavigate("dashboard")}>
                        Back to Dashboard
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Search by ID, name, or age..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem", boxSizing: "border-box" }}
                />

                {loading ? (
                    <p>Loading patients...</p>
                ) : filtered.length === 0 ? (
                    <p>No patients found.</p>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>ID</th>
                                <th style={thStyle}>First Name</th>
                                <th style={thStyle}>Last Name</th>
                                <th style={thStyle}>Age</th>
                                <th style={thStyle}>Added</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p) => (
                                <tr
                                    key={p.id}
                                    onClick={() => onNavigate("patientDetail", p.id)}
                                    style={{ cursor: "pointer" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                                    onMouseLeave={e => e.currentTarget.style.background = ""}
                                >
                                    <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "0.75rem" }}>{p.id}</td>
                                    <td style={tdStyle}>{p.first_name}</td>
                                    <td style={tdStyle}>{p.last_name}</td>
                                    <td style={tdStyle}>{p.age}</td>
                                    <td style={tdStyle}>
                                        {new Date(p.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <h2>Add Patient</h2>

                        <form onSubmit={handleSubmit}>
                            <div style={fieldStyle}>
                                <label htmlFor="first_name">First Name</label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    value={form.first_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div style={fieldStyle}>
                                <label htmlFor="last_name">Last Name</label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    value={form.last_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div style={fieldStyle}>
                                <label htmlFor="age">Age</label>
                                <input
                                    id="age"
                                    name="age"
                                    type="number"
                                    min="0"
                                    max="150"
                                    value={form.age}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div style={fieldStyle}>
                                <label htmlFor="sex">Sex</label>
                                <select
                                    id="sex"
                                    name="sex"
                                    value={form.sex}
                                    onChange={handleChange}
                                >
                                    <option value="">— Select —</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            {formError && <p role="alert">{formError}</p>}

                            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                                <button type="submit" disabled={submitting}>
                                    {submitting ? "Adding..." : "Add Patient"}
                                </button>
                                <button type="button" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}

const thStyle = {
    textAlign: "left",
    padding: "0.5rem",
    borderBottom: "2px solid #ccc",
};

const tdStyle = {
    padding: "0.5rem",
    borderBottom: "1px solid #eee",
};

const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
};

const modalStyle = {
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "400px",
};

const fieldStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    marginBottom: "0.75rem",
};
