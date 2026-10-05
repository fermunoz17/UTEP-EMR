// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
//Load the types for supabase's edge function
import "@supabase/functions-js/edge-runtime.d.ts";
//Load the helper that checks who is calling the function

import { withSupabase } from "@supabase/server";




//now this function is just a reusable error response with a message and a HTTP status
function errorResponse(message: string, status: number) {
  // send the message as JSON - it will produce something like {"error": "you must be signed int"}
  return Response.json({ error: message }, { status });
}

//Export the function so supabase can run it
export default {
  // fetch handles requests sent to this function
  //user means that the caller must provide a signed-in user token
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    //Ask supabase to check the toekn and find its user
    const {
      data: { user },
      error: userError,
    } = await ctx.supabase.auth.getUser();

    //stop if we could not identify a signed-in user
    if (userError || !user) {
      return errorResponse("You must be signed in", 401);
    }

    //Then we need to look up the user;s role and see whther their account is avtive
    const { data: profile, error: profileError } = await ctx.supabaseAdmin
      .from("profiles")// use the profiles table 
      .select("account_type, active") //Get only these two fields
      .eq("user_id", user.id) // Find this user's profile
      .single(); //expect only one profile





    //stop if the profile could not be loaded
    if (profileError || !profile) {
      return errorResponse("Unable to verify your account", 500);
    }
    //stop if the account is inactive or the user is not an admin
    if (!profile.active || profile.account_type !== "admin") {
      return errorResponse(
        "ONly active admins can manage student accounts", 403,
      );

    }
    if (req.method === "GET") {
      // read the requested page - use page 1 when none is supplied
      const page = Number(new URL(req.url).searchParams.get("page") ?? "1");
      const pageSize = 25;


      if (!Number.isSafeInteger(page) || page < 1) {
        return errorResponse("Page must be a positive whole number", 400);
      }
      const first = (page - 1) * pageSize;

      // Read student profiles after admin check above has passed
      const { data: students, error: studentError, count } = await ctx.supabaseAdmin
        .from("profiles")
        .select("user_id, first_name, last_name, active, created_at", { count: "exact" })
        .eq("account_type", "student")
        .order("created_at", { ascending: false })
        .range(first, first + pageSize - 1);

      if (studentError) {
        return errorResponse("Unable to load students", 500);
      }
      // tell the caller if the database query failed

      // Send the matching profiles back as JSON
      try {
        // Look up the Auth account for each student profile.
        const studentsWithEmail = await Promise.all(
          (students ?? []).map(async (student) => {
            const { data, error } = await ctx.supabaseAdmin.auth.admin
              .getUserById(student.user_id);

            // Stop rather than return a misleading, incomplete list.
            if (error || !data.user) {
              throw new Error("Student Auth lookup failed.");
            }

            // Keep the profile fields and add the account's email.
            return { ...student, email: data.user.email ?? null };
          }),
        );

        // Wait until all email lookups finish, then send the list.
        return Response.json({
          students: studentsWithEmail,
          page,
          pageSize,
          total: count ?? 0,
        });
      } catch {
        return errorResponse("Unable to load student emails.", 500);
      }
    }

    if (req.method === "PATCH" || req.method === "DELETE") {
      let body: Record<string, unknown>;
      try {
        const parsed = await req.json();
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          return errorResponse("The request body must be an object.", 400);
        }
        body = parsed;
      } catch {
        return errorResponse("The request body must be valid JSON.", 400);
      }

      const { userId } = body;
      const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (typeof userId !== "string" || !uuid.test(userId)) {
        return errorResponse("A valid student ID is required.", 400);
      }

      // Check the target's role before touching its Auth account.
      const { data: target, error: targetError } = await ctx.supabaseAdmin
        .from("profiles")
        .select("user_id, active")
        .eq("user_id", userId)
        .eq("account_type", "student")
        .maybeSingle();
      if (targetError) return errorResponse("Unable to verify the student.", 500);
      if (!target) return errorResponse("Student not found.", 404);

      if (req.method === "DELETE") {
        // Require deactivation first, and keep students with clinical history.
        if (target.active) return errorResponse("Deactivate this student before deleting.", 409);
        const references = await Promise.all([
          ctx.supabaseAdmin.from("assigned_cases").select("id", { count: "exact", head: true }).eq("student_id", userId),
          ctx.supabaseAdmin.from("visits").select("id", { count: "exact", head: true }).eq("created_by", userId),
          ctx.supabaseAdmin.from("appointments").select("id", { count: "exact", head: true }).eq("created_by", userId),
          ctx.supabaseAdmin.from("audit_logs").select("id", { count: "exact", head: true }).eq("actor_id", userId),
        ]);
        if (references.some((result) => result.error)) {
          return errorResponse("Unable to check this student's records.", 500);
        }
        if (references.some((result) => (result.count ?? 0) > 0)) {
          return errorResponse("This student has clinical or audit records. Keep the account deactivated instead.", 409);
        }
        const { error } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) return errorResponse("Unable to delete the student account.", 500);
        return Response.json({ deleted: userId });
      }

      const { firstName, lastName, email, active } = body;
      const editingNames = firstName !== undefined || lastName !== undefined;
      const editingEmail = email !== undefined;
      const editingStatus = active !== undefined;
      if (Number(editingNames) + Number(editingEmail) + Number(editingStatus) !== 1) {
        return errorResponse("Change names, email, or status in one request.", 400);
      }

      if (editingEmail) {
        if (typeof email !== "string") return errorResponse("A valid email is required.", 400);
        const cleanEmail = email.trim().toLowerCase();
        if (cleanEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
          return errorResponse("A valid email is required.", 400);
        }
        const { data, error } = await ctx.supabaseAdmin.auth.admin.updateUserById(
          userId, { email: cleanEmail, email_confirm: true },
        );
        if (error) {
          return errorResponse(
            error.status === 422 ? "That email is already in use." : "Unable to change the email.",
            error.status === 422 ? 409 : 500,
          );
        }
        if (!data.user) return errorResponse("Unable to change the email.", 500);
        return Response.json({ student: { user_id: userId, email: data.user.email } });
      }

      const changes: {
        first_name?: string;
        last_name?: string;
        active?: boolean;
        updated_at: string;
      } = { updated_at: new Date().toISOString() };
      if (editingNames) {
        if (typeof firstName !== "string" || typeof lastName !== "string") {
          return errorResponse("Both names are required.", 400);
        }
        const cleanFirst = firstName.trim();
        const cleanLast = lastName.trim();
        if (!cleanFirst || !cleanLast || cleanFirst.length > 100 || cleanLast.length > 100) {
          return errorResponse("Names must contain 1 to 100 characters.", 400);
        }
        changes.first_name = cleanFirst;
        changes.last_name = cleanLast;
      } else {
        if (typeof active !== "boolean") return errorResponse("Active must be true or false.", 400);
        changes.active = active;
      }

      const { data: updated, error: editError } = await ctx.supabaseAdmin
        .from("profiles")
        .update(changes)
        .eq("user_id", userId)
        .eq("account_type", "student")
        .select("user_id, first_name, last_name, active")
        .maybeSingle();
      if (editError) return errorResponse("Unable to update the student.", 500);
      if (!updated) return errorResponse("Student not found.", 404);
      return Response.json({ student: updated });
    }
    // Other request methods are not implemented yet.
    return errorResponse("Method not allowed.", 405);
  }),
};
