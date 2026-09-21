import React from "react";

export default function Dashboard({ user, onNavigate }) {
    const profile = user?.profile ?? {};
    
    const firstName =
        profile.first_name ||
        profile.firstName ||
        profile.full_name?.split(" ")[0] ||
        "User";
        
    function handleComingSoon(feature) {
        alert(`${feature} will be implemented next.`);
    }
    
    return (
        <div className="emr-app">
            {/* Dashboard Content */}
            <main className="dashboard-main">
                <section className="welcome-section">
                    <p className="section-title">Dashboard</p>
                    <h2>Welcome, {firstName}</h2>
                </section>

                {/* Care Setting */}
                <section className="dashboard-section">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">Clinical workspace</p>
                            <h3>Care Setting</h3>
                        </div>

                        <p className="section-description">
                        Select the clinical environment you want to enter.
                        </p>
                    </div>

                    <div className="care-setting-grid">
                        {/* Inpatient */}
                        <article className="care-card">
                            <div className="care-card-header">
                                <div className="care-icon" aria-hidden="true">
                                    🏥
                                </div>

                                <div>
                                    <span className="care-type">Inpatient</span>
                                    <h4>Acute Care</h4>
                                </div>
                            </div>

                            <p className="care-description">
                                Manage admitted patients and hospital-based clinical
                                workflows.
                            </p>

                            <ul className="care-features">
                                <li>Patient census</li>
                                <li>Admissions</li>
                                <li>Medication administration</li>
                            </ul>

                            <button
                                className="primary-button"
                                type="button"
                                onClick={() => handleComingSoon("Inpatient Acute Care")}
                            >
                                Enter Inpatient
                                <span aria-hidden="true">→</span>
                            </button>
                        </article>

                        {/* Outpatient */}
                        <article className="care-card">
                            <div className="care-card-header">
                                <div className="care-icon" aria-hidden="true">
                                    🩺
                                </div>

                                <div>
                                    <span className="care-type">Outpatient</span>
                                    <h4>Ambulatory Care</h4>
                                </div>
                            </div>

                            <p className="care-description">
                                Manage appointment-based visits and continuing patient care.
                            </p>

                            <ul className="care-features">
                                <li>Today's appointments</li>
                                <li>Patient visits</li>
                                <li>Medication management</li>
                            </ul>

                            <button
                                className="primary-button"
                                type="button"
                                onClick={() => handleComingSoon("Outpatient Ambulatory Care")}
                            >
                                Enter Outpatient
                                <span aria-hidden="true">→</span>
                            </button>
                        </article>
                    </div>
                </section>

                {/* Quick Access Section */}
                <section className="dashboard-section quick-access-section">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">Common tasks</p>
                            <h3>Quick Access</h3>
                        </div>
                    </div>

                    <div className="quick-access-grid">
                        <button
                        className="quick-access-card"
                        type="button"
                        onClick={() => onNavigate("patients")}
                        >
                            <span className="quick-icon" aria-hidden="true">
                                🔍
                            </span>

                            <span className="quick-content">
                                <strong>Patient Search</strong>
                                <small>Find and open a patient record</small>
                            </span>

                            <span className="quick-arrow" aria-hidden="true">
                                →
                            </span>
                        </button>

                        <button
                        className="quick-access-card"
                        type="button"
                        onClick={() => handleComingSoon("Provider Directory")}
                        >
                            <span className="quick-icon" aria-hidden="true">
                                👥
                            </span>

                            <span className="quick-content">
                                <strong>Provider Directory</strong>
                                <small>Find providers and disciplines</small>
                            </span>

                            <span className="quick-arrow" aria-hidden="true">
                                →
                            </span>
                        </button>

                        <button
                        className="quick-access-card"
                        type="button"
                        onClick={() => handleComingSoon("Scheduling")}
                        >
                            <span className="quick-icon" aria-hidden="true">
                                📅
                            </span>

                            <span className="quick-content">
                                <strong>Scheduling</strong>
                                <small>View appointments and schedules</small>
                            </span>

                            <span className="quick-arrow" aria-hidden="true">
                                →
                            </span>
                        </button>

                        <button
                        className="quick-access-card"
                        type="button"
                        onClick={() => handleComingSoon("Reports")}
                        >
                            <span className="quick-icon" aria-hidden="true">
                                📊
                            </span>

                            <span className="quick-content">
                                <strong>Reports</strong>
                                <small>View clinical and operational reports</small>
                            </span>

                            <span className="quick-arrow" aria-hidden="true">
                                →
                            </span>
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}