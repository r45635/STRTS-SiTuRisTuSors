import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let _client: SupabaseClient | null = null;

export function obtenirClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder");
  }
  return _client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return obtenirClient()[prop as keyof SupabaseClient];
  },
});

export function supabaseDisponible(): boolean {
  return !!supabaseUrl && !!supabaseAnonKey;
}
