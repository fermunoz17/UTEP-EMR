import { useState } from "react";
import { login } from "../services/auth.js";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await login(email, password);

            // App.jsx will detect the new Supabase session
            // and switch to the authenticated view.
        } catch (error) {
            console.error(error);
            setError("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <div className="scaffold-card">
                <h1>UTEP-EMR</h1>
                <p>Sign in to continue</p>

                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email</label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password">Password</label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && (
                        <p role="alert">
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </main>
    );
}

