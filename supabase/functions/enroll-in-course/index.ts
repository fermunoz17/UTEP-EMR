import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

type EnrollBody = {
  studentId?: string;
  courseNumber?: string;
  crn?: string;
};

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return errorResponse("Method not allowed", 405);
    }

    const {
      data: { user },
      error: userError,
    } = await ctx.supabase.auth.getUser();

    if (userError || !user) {
      return errorResponse("You must be signed in", 401);
    }

    // Verify the caller is an active instructor or admin
    const { data: callerProfile, error: profileError } =
      await ctx.supabaseAdmin
        .from("profiles")
        .select("account_type, active")
        .eq("user_id", user.id)
        .single();

    if (profileError || !callerProfile) {
      return errorResponse("Unable to verify your account.", 500);
    }

    const allowedRoles = ["admin", "instructor"];
    if (!callerProfile.active || !allowedRoles.includes(callerProfile.account_type)) {
      return errorResponse(
        "Only active admins and instructors can enroll students.",
        403,
      );
    }

    let body: EnrollBody;
    try {
      body = await req.json();
    } catch {
      return errorResponse("The request body must be valid JSON", 400);
    }

    const studentId = body.studentId?.trim();
    const courseNumber = body.courseNumber?.trim();
    const crn = body.crn?.trim();

    if (!studentId || !courseNumber || !crn) {
      return errorResponse("studentId, courseNumber, and crn are required", 400);
    }

    // Upsert the course — create it if it doesn't exist for this instructor+crn
    const { data: course, error: courseError } = await ctx.supabaseAdmin
      .from("courses")
      .upsert(
        { instructor_id: user.id, course_number: courseNumber, crn },
        { onConflict: "instructor_id,crn", ignoreDuplicates: false },
      )
      .select("id")
      .single();

    if (courseError || !course) {
      return errorResponse(
        courseError?.message ?? "Unable to find or create the course.",
        500,
      );
    }

    // Enroll the student — ignore if already enrolled
    const { error: enrollError } = await ctx.supabaseAdmin
      .from("course_enrollments")
      .upsert(
        { course_id: course.id, student_id: studentId, enrolled_by: user.id },
        { onConflict: "course_id,student_id", ignoreDuplicates: true },
      );

    if (enrollError) {
      return errorResponse(
        enrollError.message ?? "Unable to enroll the student.",
        500,
      );
    }

    return Response.json({ enrolled: true, courseId: course.id }, { status: 200 });
  }),
};
