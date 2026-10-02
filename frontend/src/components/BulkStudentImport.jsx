import { useState } from "react";
import { createStudent } from "../services/students";

export default function BulkStudentImport() {
    const [bulkData, setBulkData] = useState('');
    const [bulkSubmitting, setBulkSubmitting] = useState(false);
    const [bulkResults, setBulkResults] = useState(null);
    
    async function handleBulkSubmit(event) {
        event.preventDefault();

        if (bulkData.trim().length == 0) return;

        setBulkSubmitting(true);
        setBulkResults(null);
        
        const lines = bulkData.trim().split('\n');

        let successCount = 0;
        let importErrors = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            let rowNumber = i + 1;
            if (line.length === 0) continue;

            // Check for header line
            let lowercaseLine = line.toLowerCase();
            if (rowNumber === 1 && !lowercaseLine.includes("@")) continue;

            const parts = line.split(',');

            if (parts.length >= 2) {
                let fullName = parts[0].trim();
                let email = parts[1].trim();

                let nameParts = fullName.split(' ');
                let firstName = nameParts[0].trim();
                let lastName = nameParts.slice(1).join(' ') || "Unknown";
                // auto create password
                let createdPassword = firstName.charAt(0).toUpperCase() + lastName.replace(/\s+/g, '') + "!2026";
                let studentData = {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: createdPassword
                }
            

                try {
                    await createStudent(studentData);
                    successCount++; 
                } catch (err) {
                    importErrors.push("Row " + rowNumber + " (" + studentData.email + "): " + err.message);
                }  
            } else {
                // Not enough data in line
                importErrors.push("Row " + rowNumber + ": Missing information. Expected 2 columns.");
            }
        }

        setBulkResults({
            successCount: successCount,
            errors: importErrors
        });

        setBulkSubmitting(false);

        if (importErrors.length === 0 && successCount > 0){
            setBulkData("");
        }
    }
    
    return (
        <section className="student-form-panel" aria-labelledby="bulk-import-heading" style={{ marginTop: "2rem" }}>
            <div className="student-form-heading">
                <h3 id="bulk-import-heading">Bulk Import Students</h3>
                <p>Paste comma-separated values below: <code>Full Name, Email</code></p>
            </div>
            {bulkResults && (
                <div style={{ marginBottom: "1.5rem" }}>
                    {bulkResults.successCount > 0 && (
                        <p className="form-message form-message-success" role="status">
                            Successfully imported {bulkResults.successCount} student(s).
                        </p>
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
                        rows={6}
                        value={bulkData}
                        onChange={(e) => setBulkData(e.target.value)}
                        disabled={bulkSubmitting}
                        placeholder="John Doe, john.doe@example.com"
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

