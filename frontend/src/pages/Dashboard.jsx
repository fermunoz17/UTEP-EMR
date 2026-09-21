import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth.js";

export default function Dashboard({ user }) {
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    return (
        <main>
            <div className="scaffold-card">
                <h1>UTEP-EMR</h1>

                <p>
                    Signed in as: <strong>{user.email}</strong>
                </p>

                <p>
                    Account type:{" "}
                    <strong>{user.profile.account_type}</strong>
                </p>

                {user.profile.account_type === "admin" && (
                    <button onClick={() => navigate("/patients")}>
                        Patient Manager
                    </button>
                )}

                {user.profile.account_type !== "admin" && (
                    <button onClick={() => navigate("/lookup")}>
                        Look Up Patient
                    </button>
                )}

                {user.profile.account_type !== "admin" && (
                    <button onClick={() => navigate("/appointments")}>
                        Appointments
                    </button>
                )}

                <button onClick={handleLogout}>
                    Sign Out
                </button>
            </div>
        </main>
    );
}