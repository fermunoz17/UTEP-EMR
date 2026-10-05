import { supabase } from "../supabase.js";

// ask the create student edge function to create a new student account
export async function createStudent(student) {
    const { data, error } = await supabase.functions.invoke("create-student",
        {
            body: {
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                password: student.password,
            },
        }
    );

    if (error) {
        let message = error.message;

        if (error.context instanceof Response) {
            try {
                const details = await error.context.json();
                message = details.error ?? message;
            } catch {
                // Keep the original Supabase error message
            }
        }

        throw new Error(message);
    }

    // Any unexpected successful response will be treated as an error
    if (!data?.student) {
        throw new Error("The student account was created without a valid response.");
    }

    return data.student;
}

export async function enrollStudent(studentId, courseNumber, crn) {
    const { data, error } = await supabase.functions.invoke("enroll-in-course", {
        body: { studentId, courseNumber, crn },
    });

    if (error) {
        let message = error.message;

        if (error.context instanceof Response) {
            try {
                const details = await error.context.json();
                message = details.error ?? message;
            } catch {
                // Keep the original error message.
            }
        }

        throw new Error(message);
    }

    return data;
}

// here we need to turn an the edge function error into a message we can show on screen.
async function managementErrorMessage(error) {
    let message = error.message || "Student management request failed.";

    if (error.context instanceof Response) {
        try {
            const details = await error.context.json();
            message = details.error ?? message;
        } catch {
            // we keep the original message
        }
    }

    return message;
}

// load one page of student accounts.
export async function listStudents(page = 1) {
    const { data, error } = await supabase.functions.invoke(
        `manage-students?page=${page}`,
        { method: "GET" },
    );

    if (error) throw new Error(await managementErrorMessage(error));
    if (!Array.isArray(data?.students)) {
        throw new Error("The student list had an invalid response.");
    }

    return data;
}

// Change a student's name, email, or active status
export async function updateStudent(userId, changes) {
    const { data, error } = await supabase.functions.invoke("manage-students", {
        method: "PATCH",
        body: { ...changes, userId },
    });

    if (error) throw new Error(await managementErrorMessage(error));
    if (!data?.student) {
        throw new Error("The student update had an invalid response.");
    }

    return data.student;
}

export async function deleteStudent(userId) {
    const { data, error } = await supabase.functions.invoke("manage-students", {
        method: "DELETE",
        body: { userId },
    });

    if (error) throw new Error(await managementErrorMessage(error));
    if (data?.deleted !== userId) {
        throw new Error("The student deletion had an invalid response.");
    }
}
