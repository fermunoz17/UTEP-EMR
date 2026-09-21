import React from "react";
import { logout } from "../services/auth.js";

export default function Header({ user }) {
  const profile = user?.profile ?? {};
  
  const fullName =
    profile.full_name ||
    profile.name ||
    `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
    user?.email ||
    "User";

  const role =
    profile.role ||
    profile.discipline ||
    "User";

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Unable to log out:", error);
    }
  }
  
  return (
    <header className="emr-header">
      <div className="emr-brand">
        <div className="emr-logo" aria-hidden="true">
          +
        </div>

        <div>
          <h1>Educational EMR</h1>
        </div>
      </div>

      <div className="user-area">
        <div className="user-information">
          <span className="user-name">{fullName}</span>
          <span className="user-role">Role: {role}</span>
        </div>

        <button
          className="logout-button"
          type="button"
          onClick={handleLogout}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}