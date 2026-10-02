import { supabase } from "../supabase.js";

export async function getMyAssignedCases() {
    const { data, error } = await supabase
        .from("assigned_cases")
        .select("*")
        .order("assigned_at", { ascending: false });
    if (error) throw error;
    return data;
}

export async function startCase(caseId) {
    const { data, error } = await supabase
        .from("assigned_cases")
        .update({ encounter_status: "in progress", updated_at: new Date().toISOString() })
        .eq("id", caseId)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function saveCaseNotes(caseId, notes) {
    const { data, error } = await supabase
        .from("assigned_cases")
        .update({
            encounter_notes: notes,
            encounter_status: "in progress",
            updated_at: new Date().toISOString(),
        })
        .eq("id", caseId)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function submitCase(caseId, notes) {
    const { data, error } = await supabase
        .from("assigned_cases")
        .update({
            encounter_notes: notes,
            encounter_status: "pending review",
            updated_at: new Date().toISOString(),
        })
        .eq("id", caseId)
        .select()
        .single();
    if (error) throw error;
    return data;
}
