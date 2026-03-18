// frontend/src/lib/supabaseClient.js

import { createClient } from "@supabase/supabase-js";

/**
 * Replace these with your Supabase project keys
 * You can find them in Supabase dashboard:
 * Settings → API
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

/**
 * Create Supabase client with service key (bypasses RLS for admin operations)
 */
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
