import { useEffect, useState } from "react";
import { supabase } from "../supabase.js";
import PatientRegistrationForm from "../components/PatientRegistrationForm.jsx";

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

        return (
        <main>
            <div className="scaffold-card">
                <h1>Patient Manager</h1>

                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                    <button onClick={() => setShowModal(!showModal)}>
                        {showModal ? "← Back to Patient List" : "+ Add Patient"}
                    </button>
                    <button onClick={() => onNavigate("dashboard")}>
                        Back to Dashboard
                    </button>
                </div>

                {showModal ? (
                    <PatientRegistrationForm 
                        onPatientCreated={() => { 
                            fetchPatients(); 
                            setShowModal(false); 
                        }} 
                    />
                ) : (
                    <>
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
                                            <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "0.75rem" }}>{p.id.slice(0, 8)}...</td>
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
                    </>
                )}
            </div>
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
