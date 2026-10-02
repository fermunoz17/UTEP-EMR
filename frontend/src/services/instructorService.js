import { supabase } from "../supabase.js";
import { logCaseAction, ACTION_TYPES } from "./auditService.js";

export async function searchPatients(query) {
    let q = supabase
        .from("patients")
        .select("id, first_name, last_name, age, sex, occupation, medications, last_visit_notes")
        .order("last_name");

    if (query.trim()) {
        q = q.or(
            `first_name.ilike.%${query}%,last_name.ilike.%${query}%`
        );
    }

    const { data, error } = await q.limit(50);
    if (error) throw error;
    return data;
}

export async function getPatientById(id) {
    const { data, error } = await supabase
        .from("patients")
        .select("id, first_name, last_name, age, sex, occupation, medications, last_visit_notes")
        .eq("id", id)
        .single();
    if (error) throw error;
    return data;
}

export async function getMyTemplates() {
    const { data, error } = await supabase
        .from("patient_templates")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
}

export async function getTemplateById(id) {
    const { data, error } = await supabase
        .from("patient_templates")
        .select("*")
        .eq("id", id)
        .single();
    if (error) throw error;
    return data;
}

export async function createTemplate(templateData) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
        .from("patient_templates")
        .insert({ ...templateData, instructor_id: user.id })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateTemplate(id, templateData) {
    const { data, error } = await supabase
        .from("patient_templates")
        .update(templateData)
        .eq("id", id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteTemplate(id) {
    const { error } = await supabase
        .from("patient_templates")
        .delete()
        .eq("id", id);
    if (error) throw error;
}

export async function getStudents() {
    const { data, error } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .eq("account_type", "student")
        .eq("active", true)
        .order("last_name");
    if (error) throw error;
    return data;
}

export async function getMyAssignedCases() {
    const { data, error } = await supabase
        .from("assigned_cases")
        .select(`
            *,
            patient_templates ( first_name, last_name, chief_complaint ),
            profiles!student_id ( first_name, last_name )
        `)
        .order("assigned_at", { ascending: false });
    if (error) throw error;
    return data;
}

export async function signOffCase(caseId, instructorFeedback) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
        .from("assigned_cases")
        .update({ encounter_status: "completed", instructor_feedback: instructorFeedback, updated_at: new Date().toISOString() })
        .eq("id", caseId)
        .select()
        .single();
    if (error) throw error;
    await logCaseAction(caseId, user.id, ACTION_TYPES.CASE_SIGNED_OFF, "pending review", "completed").catch(() => {});
    if (instructorFeedback?.trim()) {
        await logCaseAction(caseId, user.id, ACTION_TYPES.FEEDBACK_ADDED, null, instructorFeedback.trim()).catch(() => {});
    }
    return data;
}

export async function returnCase(caseId, instructorFeedback) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
        .from("assigned_cases")
        .update({ encounter_status: "in progress", instructor_feedback: instructorFeedback, updated_at: new Date().toISOString() })
        .eq("id", caseId)
        .select()
        .single();
    if (error) throw error;
    await logCaseAction(caseId, user.id, ACTION_TYPES.CASE_RETURNED, "pending review", "in progress").catch(() => {});
    if (instructorFeedback?.trim()) {
        await logCaseAction(caseId, user.id, ACTION_TYPES.FEEDBACK_ADDED, null, instructorFeedback.trim()).catch(() => {});
    }
    return data;
}

export async function assignCase(templateId, studentId, patientSnapshot) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
        .from("assigned_cases")
        .insert({
            template_id: templateId,
            student_id: studentId,
            assigned_by: user.id,
            patient_snapshot: patientSnapshot,
        })
        .select()
        .single();
    if (error) throw error;
    await logCaseAction(data.id, user.id, ACTION_TYPES.CASE_ASSIGNED, null, studentId).catch(() => {});
    return data;
}
