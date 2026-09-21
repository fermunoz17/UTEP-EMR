import { useEffect, useState } from "react";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Header from "./components/Header.jsx";
import Navbar from "./components/Navbar.jsx";
import PatientManager from "./pages/PatientManager.jsx";
import PatientDetail from "./pages/PatientDetail.jsx";
import PatientLookup from "./pages/PatientLookup.jsx";
import StudentPatientDetail from "./pages/StudentPatientDetail.jsx";
import Appointments from "./pages/Appointments.jsx";

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
    const [nav, setNav] = useState({ page: "dashboard", id: null });

    function navigate(page, id = null) {
        setNav({ page, id });
    }

    useEffect(() => {
        async function initializeAuth() {
            try {
                const currentSession = await getSession();
                setSession(currentSession);
                if (currentSession) await loadUser();
            } catch (error) {
                console.error(error);
                setError("Unable to initialize authentication.");
            } finally {
                setLoading(false);
            }
        }

        initializeAuth();

        const { data: { subscription } } = onAuthStateChange(async (_event, newSession) => {
            setSession(newSession);
            if (newSession) await loadUser();
            else setUser(null);
        });

        return () => subscription.unsubscribe();
    }, []);

    async function loadUser() {
        try {
            const currentUser = await getCurrentUserWithProfile();
            if (!currentUser) { setUser(null); return; }
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

    if (loading) return <p>Loading...</p>;

    if (!session) {
        return (
            <>
                {error && <p role="alert">{error}</p>}
                <Login />
            </>
        );
    }

    if (!user) return <p>Loading account...</p>;

    const isAdmin = user.profile.account_type === "admin";

    const navbarPage = nav.page === "patientManager" || nav.page === "patientDetail" ? "patients"
        : nav.page === "patientLookup" || nav.page === "studentPatientDetail" ? "patients"
        : nav.page === "appointments" ? "appointments"
        : "dashboard";

    function handleNavbarNavigate(page) {
        if (page === "patients") navigate(isAdmin ? "patientManager" : "patientLookup");
        else if (page === "appointments") navigate("appointments");
        else navigate("dashboard");
    }

    let pageContent;
    switch (nav.page) {
        case "patientManager":
            pageContent = <PatientManager onNavigate={navigate} />;
            break;
        case "patientDetail":
            pageContent = <PatientDetail id={nav.id} onNavigate={navigate} />;
            break;
        case "patientLookup":
            pageContent = <PatientLookup onNavigate={navigate} />;
            break;
        case "studentPatientDetail":
            pageContent = <StudentPatientDetail id={nav.id} onNavigate={navigate} />;
            break;
        case "appointments":
            pageContent = <Appointments onNavigate={navigate} />;
            break;
        case "dashboard":
        default:
            pageContent = <Dashboard user={user} onNavigate={navigate} />;
    }

    return (
        <div className="emr-app">
            <Header user={user} />
            <Navbar user={user} currentPage={navbarPage} onNavigate={handleNavbarNavigate} />
            {pageContent}
            <footer className="emr-footer">
                <span>Educational EMR Prototype</span>
                <span>For educational use only</span>
            </footer>
        </div>
    );
}
