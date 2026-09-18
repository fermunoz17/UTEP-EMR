import { supabase } from "../supabase.js"

export async function getCurrentUserWithProfile() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;

    if(!data.user) {
        return null;
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
    
    if (profileError) throw profileError;
    
    return {
        ...data.user,
        profile
    };
}