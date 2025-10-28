import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helpful diagnostics in dev if env is missing/misconfigured
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.\n" +
      "Create a .env.local file in the Venture-X folder with:\n" +
      "VITE_SUPABASE_URL=https://<project-ref>.supabase.co\n" +
      "VITE_SUPABASE_ANON_KEY=<anon-key>"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
