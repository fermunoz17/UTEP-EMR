import { supabase } from "../supabase.js";

// Ask the create-student edge function to create a new student account


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
                // Keep the original Supabase error message.
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