import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase.js";

const STATUS_COLORS = {
    scheduled: { background: "#e8f4fd", color: "#1a6fa8" },
    completed: { background: "#e8f8e8", color: "#2a7a2a" },
    cancelled: { background: "#fdecea", color: "#c0392b" },
};

export default function Appointments() {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("scheduled");

    useEffect(() => {
        fetchAppointments();
    }, []);

    async function fetchAppointments() {
        setLoading(true);
        const { data, error } = await supabase
            .from("appointments")
            .select("*, patients(first_name, last_name)")
            .order("scheduled_date", { ascending: true })
            .order("scheduled_time", { ascending: true });

        if (error) {
            console.error("Failed to fetch appointments:", error);
        } else {
            setAppointments(data);
        }
        setLoading(false);
    }

    async function handleStatusChange(apptId, newStatus) {
        const { error } = await supabase
            .from("appointments")
            .update({ status: newStatus })
            .eq("id", apptId);

        if (error) {
            console.error("Failed to update status:", error);
        } else {
            await fetchAppointments();
        }
    }

    const filtered = filter === "all"
        ? appointments
        : appointments.filter((a) => a.status === filter);

    return (
        <main>
            <div className="scaffold-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h1>Appointments</h1>
                    <button onClick={() => navigate("/dashboard")}>← Back</button>
                </div>

                {/* Filter tabs */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
                    {["scheduled", "completed", "cancelled", "all"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            style={{
                                padding: "0.3rem 0.8rem",
                                borderRadius: "999px",
                                border: "1px solid #ccc",
                                background: filter === s ? "#333" : "#fff",
                                color: filter === s ? "#fff" : "#333",
                                cursor: "pointer",
                                textTransform: "capitalize",
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <p>Loading appointments...</p>
                ) : filtered.length === 0 ? (
                    <p style={{ color: "#aaa" }}>No {filter === "all" ? "" : filter} appointments.</p>
                ) : (
                    filtered.map((a) => (
                        <div key={a.id} style={cardStyle}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                                <div>
                                    <strong style={{ fontSize: "1rem" }}>
                                        {a.patients?.first_name} {a.patients?.last_name}
                                    </strong>
                                    <div style={{ color: "#555", fontSize: "0.9rem" }}>{a.appointment_type}</div>
                                </div>

                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontWeight: "bold" }}>
                                        {new Date(a.scheduled_date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                                    </div>
                                    {a.scheduled_time && (
                                        <div style={{ color: "#555", fontSize: "0.85rem" }}>
                                            {formatTime(a.scheduled_time)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {a.notes && (
                                <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem", color: "#444" }}>{a.notes}</p>
                            )}

                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.75rem" }}>
                                <span style={{ ...badgeStyle, ...STATUS_COLORS[a.status] }}>
                                    {a.status}
                                </span>

                                {a.status === "scheduled" && (
                                    <>
                                        <button
                                            style={smallBtnStyle}
                                            onClick={() => handleStatusChange(a.id, "completed")}
                                        >
                                            Mark Completed
                                        </button>
                                        <button
                                            style={{ ...smallBtnStyle, color: "#c0392b" }}
                                            onClick={() => handleStatusChange(a.id, "cancelled")}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}

                                <button
                                    style={{ ...smallBtnStyle, marginLeft: "auto" }}
                                    onClick={() => navigate(`/lookup/${a.patient_id}`)}
                                >
                                    View Patient →
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}

function formatTime(time) {
    const [h, m] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(h), parseInt(m));
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

const cardStyle = {
    padding: "1rem",
    marginBottom: "0.75rem",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
};

const badgeStyle = {
    display: "inline-block",
    padding: "0.2rem 0.6rem",
    borderRadius: "999px",
    fontSize: "0.8rem",
    fontWeight: "bold",
    textTransform: "capitalize",
};

const smallBtnStyle = {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "0.85rem",
    padding: "0",
    color: "#333",
};
