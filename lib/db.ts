import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const globalForSupabase = globalThis as unknown as {
  supabase: ReturnType<typeof createClient> | undefined;
};

export const db =
  globalForSupabase.supabase ??
  createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

if (process.env.NODE_ENV !== "production") globalForSupabase.supabase = db;
