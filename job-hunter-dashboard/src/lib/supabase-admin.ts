import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client with service role key.
 * Use this in API routes only -- never expose to the client.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
