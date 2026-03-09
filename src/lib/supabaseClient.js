// frontend/src/lib/supabaseClient.js

import { createClient } from "@supabase/supabase-js";

/**
 * Replace these with your Supabase project keys
 * You can find them in Supabase dashboard:
 * Settings → API
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Create Supabase client
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
