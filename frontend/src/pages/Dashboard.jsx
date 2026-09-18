import { logout } from "../services/auth.js";

export default function Dashboard({ user }) {
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

                <button onClick={handleLogout}>
                    Sign Out
                </button>
            </div>
        </main>
    );
}