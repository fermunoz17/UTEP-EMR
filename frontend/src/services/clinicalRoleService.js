import { supabase } from "../supabase.js";

export async function getMyClinicalRoles() {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) return [];

    const { data, error } = await supabase
        .from("profile_roles")
        .select(`roles(role_name)`)
        .eq("user_id", user.id);

    if (error) throw error;

    return (data ?? [])
        .map((item) => item.roles?.role_name)
        .filter(Boolean);
}