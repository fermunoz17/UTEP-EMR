import { supabase } from "../supabase.js";

/**
 * Check whether the currently authenticated user
 * has a specific EMR permission.
 */
export async function hasPermission(permissionName) {
    const { data, error } = await supabase.rpc("has_permission", {
        requested_permission: permissionName,
    });

    if (error) throw error;

    return data;
}