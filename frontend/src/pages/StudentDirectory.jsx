import { useEffect, useState } from "react";
import { listStudents } from "../services/students.js";
import StudentRow from "./StudentRow.jsx";
export default function StudentDirectory({ refreshKey = 0 }) {
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ students: [], total: 0, pageSize: 25 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reload, setReload] = useState(0);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError("");
            try {
                const next = await listStudents(page);
                if (!cancelled && page > 1 && next.students.length === 0) {
                    setPage(page - 1);
                } else if (!cancelled) {
                    setResult(next);
                }
            } catch (loadError) {
                if (!cancelled) setError(loadError.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [page, refreshKey, reload]);

    return (
        <section className="student-directory" aria-labelledby="student-directory-heading">
            <div className="student-directory-toolbar">

                <h3 id="student-directory-heading">Student Accounts</h3>
                <button className="student-small-button" type="button" disabled={loading}
                    onClick={() => setReload((value) => value + 1)}>
                    Refresh
                </button>
            </div>

            {loading ? <p className="student-directory-feedback">Loading students...</p> : error ? (
                <p className="form-message form-message-error" role="alert">{error}</p>) 
                : result.students.length === 0 ? (
                <p className="student-directory-feedback">No students found.</p>) 
                : 
                (
                <div className="student-directory-scroll">
                    <table className="student-directory-table">
                        <thead><tr><th scope="col">Name</th><th scope="col">Email</th>
                            <th scope="col">Status</th><th scope="col">Actions</th></tr></thead>
                        <tbody>
                            {result.students.map((student) => (
                                <StudentRow
                                    key={student.user_id}
                                    student={student}
                                    onChanged={() => setReload((value) => value + 1)}/>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!error && result.total > 0 && <div className="student-directory-pages">
                <span>{result.total} student{result.total === 1 ? "" : "s"}</span>
                <div>
                    <button className="student-small-button" type="button" disabled={loading || page === 1}
                        onClick={() => setPage((value) => value - 1)}>Previous</button>
                    <span>Page {page} of {Math.max(1, Math.ceil(result.total / result.pageSize))}</span>
                    <button className="student-small-button" type="button"
                        disabled={loading || page * result.pageSize >= result.total}
                        onClick={() => setPage((value) => value + 1)}>Next</button>
                </div>
            </div>}
        </section>
    );
}
