import React from "react";

export default function Navbar({ currentPage, onNavigate, user }) {
  const profile = user?.profile ?? {};

  const canManageStudents = ["admin", "instructor"].includes(
    profile.account_type,
  );

  return (
    <nav className="main-navigation" aria-label="Main navigation">
      <div className="navigation-inner">

        <button
          className={`nav-link ${currentPage === "dashboard" ? "active" : ""
            }`}
          type="button"
          onClick={() => onNavigate("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={`nav-link ${currentPage === "patients" ? "active" : ""
            }`}
          type="button"
          onClick={() => onNavigate("patients")}
        >
          Patients
        </button>

        {canManageStudents && (
          <button
            className={`nav-link ${currentPage === "students" ? "active" : ""
              }`}
            type="button"
            onClick={() => onNavigate("students")}
          >
            Students
          </button>
        )}

        {/* TODO: Implement Providers Page */}
        <button
          className="nav-link"
          type="button"
          disabled
          title="Provider Directory is not yet available"
        >
          Providers
        </button>

        {/* TODO: Implement Scheduling Page */}
        <button
          className="nav-link"
          type="button"
          disabled
          title="Scheduling is not yet available"
        >
          Scheduling
        </button>

        {/* TODO: Implement Reports Page */}
        <button
          className="nav-link"
          type="button"
          disabled
          title="Reports are not yet available"
        >
          Reports
        </button>

      </div>
    </nav>
  );
}