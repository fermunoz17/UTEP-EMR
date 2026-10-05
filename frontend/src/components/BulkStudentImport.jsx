import { useState } from "react";
import { createStudent, enrollStudent } from "../services/students";

export default function BulkStudentImport({ onImported }) {
    const [bulkData, setBulkData] = useState('');
    const [bulkSubmitting, setBulkSubmitting] = useState(false);
    const [bulkResults, setBulkResults] = useState(null);

    async function handleBulkSubmit(event) {
        event.preventDefault();

        if (bulkData.trim().length === 0) return;

        setBulkSubmitting(true);
        setBulkResults(null);

        const lines = bulkData.trim().split('\n');

        let successCount = 0;
        let importErrors = [];
        let createdAccounts = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            let rowNumber = i + 1;
            if (line.length === 0) continue;

            // Skip header row (no @ in line)
            if (rowNumber === 1 && !line.toLowerCase().includes("@")) continue;

            const parts = line.split(',');

            if (parts.length >= 4) {
                let fullName = parts[0].trim();
                let email = parts[1].trim();
                let courseNumber = parts[2].trim();
                let crn = parts[3].trim();

                if (!courseNumber || !crn) {
                    importErrors.push(`Row ${rowNumber}: Missing course number or CRN.`);
                    continue;
                }

                let nameParts = fullName.split(' ');
                let firstName = nameParts[0].trim();
                let lastName = nameParts.slice(1).join(' ') || "Unknown";

                let createdPassword = firstName.charAt(0).toUpperCase() + lastName.replace(/\s+/g, '') + "!2026";
                let studentData = {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: createdPassword
                };

                try {
                    const student = await createStudent(studentData);
                    await enrollStudent(student.id, courseNumber, crn);
                    successCount++; 
                    createdAccounts.push({ email, password: createdPassword });
                } catch (err) {
                    importErrors.push(`Row ${rowNumber} (${email}): ${err.message}`);
                }
            } else {
                importErrors.push(`Row ${rowNumber}: Missing information. Expected 4 columns (Full Name, Email, Course Number, CRN).`);
            }
        }

        setBulkResults({
            successCount: successCount,
            errors: importErrors,
            accounts: createdAccounts
        });

        setBulkSubmitting(false);

        if (successCount > 0) onImported?.();

        if (importErrors.length === 0 && successCount > 0){
            setBulkData("");
        }
    }

    return (
        <section className="student-form-panel" aria-labelledby="bulk-import-heading" style={{ marginTop: "2rem" }}>
            <div className="student-form-heading">
                <h3 id="bulk-import-heading">Bulk Import Students</h3>
                <p>Paste comma-separated values below: <code>Full Name, Email, Course Number, CRN</code></p>
            </div>
            {bulkResults && (
                <div style={{ marginBottom: "1.5rem" }}>
                    {bulkResults.successCount > 0 && (
                        <div className="form-message form-message-success" role="status">
                            <p>Successfully imported and enrolled {bulkResults.successCount} student(s). Copy these temporary passwords now; they disappear when you leave this page.</p>
                            <ul className="student-import-credentials">
                                {bulkResults.accounts.map((account) => (
                                    <li key={account.email}><span>{account.email}</span><code>{account.password}</code></li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {bulkResults.errors.length > 0 && (
                        <div className="form-message form-message-error" role="alert" style={{ whiteSpace: "pre-wrap", textAlign: "left" }}>
                            <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Errors encountered:</p>
                            <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
                                {bulkResults.errors.map((err, idx) => (
                                    <li key={idx}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
            <form className="student-form" onSubmit={handleBulkSubmit}>
                <div className="student-form-field" style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="bulk-data">CSV Data</label>
                    <textarea
                        id="bulk-data"
                        rows={8}
                        value={bulkData}
                        onChange={(e) => setBulkData(e.target.value)}
                        disabled={bulkSubmitting}
                        placeholder={`Full Name, Email, Course Number, CRN\nJohn Doe, jdoe@miners.utep.edu, PHARM 4301, 11234\nJane Smith, jsmith@miners.utep.edu, PHARM 4302, 22345`}
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid #d1d5db", fontFamily: "monospace", resize: "vertical" }}
                        required
                    />
                </div>
                <div className="student-form-actions">
                    <button className="primary-action-button" type="submit" disabled={bulkSubmitting}>
                        {bulkSubmitting ? "Importing..." : "Run Bulk Import"}
                    </button>
                </div>
            </form>
        </section>
    );
}
