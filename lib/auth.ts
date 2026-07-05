import { supabase, supabaseDisponible } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export async function envoyerMagicLink(email: string): Promise<{ erreur?: string }> {
  if (!supabaseDisponible()) return { erreur: "Supabase non configuré" };
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
  });
  return error ? { erreur: error.message } : {};
}

export async function seConnecter(email: string, token: string): Promise<{ erreur?: string }> {
  if (!supabaseDisponible()) return { erreur: "Supabase non configuré" };
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  return error ? { erreur: error.message } : {};
}

export async function seDeconnecter(): Promise<void> {
  if (!supabaseDisponible()) return;
  await supabase.auth.signOut();
}

export async function obtenirUtilisateur(): Promise<User | null> {
  if (!supabaseDisponible()) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export function ecouterChangementsAuth(callback: (user: User | null) => void) {
  if (!supabaseDisponible()) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}
