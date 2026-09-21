import { useEffect, useState } from "react";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Header from "./components/Header.jsx";
import Navbar from "./components/Navbar.jsx";
import Patients from "./pages/Patients.jsx";

import {
    getSession,
    logout,
    onAuthStateChange
} from "./services/auth.js";

import { getCurrentUserWithProfile } from "./services/profile.js";

export default function App() {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState("dashboard");
    
    useEffect(() => {
        async function initializeAuth() {
            try {
                const currentSession = await getSession();

                setSession(currentSession);

                if (currentSession) {
                    await loadUser();
                }
            } catch (error) {
                console.error(error);
                setError("Unable to initialize authentication.");
            } finally {
                setLoading(false);
            }
        }

        initializeAuth();

        const {
            data: { subscription }
        } = onAuthStateChange(async (_event, newSession) => {
            setSession(newSession);

            if (newSession) {
                await loadUser();
            } else {
                setUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    async function loadUser() {
        try {
            const currentUser = await getCurrentUserWithProfile();

            if (!currentUser) {
                setUser(null);
                return;
            }

            if (!currentUser.profile.active) {
                await logout();
                setError("Your account is inactive.");
                return;
            }

            setUser(currentUser);
            setError("");
        } catch (error) {
            console.error(error);
            setError("Unable to load your account.");
        }
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!session) {
        return (
            <>
                {error && <p role="alert">{error}</p>}
                <Login />
            </>
        );
    }

    let pageContent;

    switch (page) {
        case "patients":
            pageContent = <Patients />;
            break;

        case "dashboard":

        default:
            pageContent = (
                <Dashboard
                user={user}
                onNavigate={setPage}
                />
            );
            break;
    }

    return (
        <div className="emr-app">
            <Header user={user} />

            <Navbar
            user={user}
            currentPage={page}
            onNavigate={setPage}
            />

            {pageContent}

            <footer className="emr-footer">
            <span>Educational EMR Prototype</span>
            <span>For educational use only</span>
            </footer>
        </div>
    );
}