import { createClient } from '@supabase/supabase-js';

// get supabase env credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// create client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

