import { supabase, supabaseDisponible } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface JoueurMultijoueur {
  id: string;
  nom: string;
  estHote: boolean;
  estConnecte: boolean;
  estElimine: boolean;
  refusRestants: number;
}

export interface EtatPartieMultijoueur {
  statut: "attente" | "en_cours" | "terminee";
  joueurs: JoueurMultijoueur[];
  tourJoueurId: string | null;
  blagueActuelleId: string | null;
  gagnantId: string | null;
}

export interface PartieMultijoueur {
  id: string;
  code: string;
  etat: EtatPartieMultijoueur;
}

function genererCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function creerPartieMultijoueur(nomHote: string): Promise<{ partie?: PartieMultijoueur; erreur?: string }> {
  if (!supabaseDisponible()) return { erreur: "Supabase non configuré — ajoutez .env.local" };

  const code = genererCode();
  const etatInitial: EtatPartieMultijoueur = {
    statut: "attente",
    joueurs: [],
    tourJoueurId: null,
    blagueActuelleId: null,
    gagnantId: null,
  };

  const { data, error } = await supabase
    .from("parties_multijoueur")
    .insert({ code, etat: etatInitial as unknown as Record<string, unknown> })
    .select()
    .single();

  if (error) return { erreur: error.message };

  // Ajouter l'hôte comme premier joueur
  await supabase.from("joueurs_multijoueur").insert({
    partie_id: data.id,
    nom: nomHote,
    est_hote: true,
    donnees: {},
  });

  return { partie: { id: data.id, code: data.code, etat: etatInitial } };
}

export async function rejoindrePartie(code: string, nomJoueur: string): Promise<{ partie?: PartieMultijoueur; erreur?: string }> {
  if (!supabaseDisponible()) return { erreur: "Supabase non configuré — ajoutez .env.local" };

  const { data: partie, error } = await supabase
    .from("parties_multijoueur")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("statut", "attente")
    .single();

  if (error || !partie) return { erreur: "Partie introuvable ou déjà commencée" };

  await supabase.from("joueurs_multijoueur").insert({
    partie_id: partie.id,
    nom: nomJoueur,
    est_hote: false,
    donnees: {},
  });

  return { partie: { id: partie.id, code: partie.code, etat: partie.etat as EtatPartieMultijoueur } };
}

export async function mettreAJourEtatPartie(partieId: string, etat: EtatPartieMultijoueur): Promise<void> {
  if (!supabaseDisponible()) return;
  await supabase
    .from("parties_multijoueur")
    .update({ etat: etat as unknown as Record<string, unknown>, updated_at: new Date().toISOString() })
    .eq("id", partieId);
}

export async function obtenirJoueursPartie(partieId: string): Promise<JoueurMultijoueur[]> {
  if (!supabaseDisponible()) return [];
  const { data } = await supabase
    .from("joueurs_multijoueur")
    .select("*")
    .eq("partie_id", partieId)
    .order("created_at");
  if (!data) return [];
  return data.map(j => ({
    id: j.id,
    nom: j.nom,
    estHote: j.est_hote,
    estConnecte: j.est_connecte,
    estElimine: false,
    refusRestants: 2,
  }));
}

export function ecouterPartie(
  partieId: string,
  onEtatChange: (etat: EtatPartieMultijoueur) => void
): RealtimeChannel | null {
  if (!supabaseDisponible()) return null;

  const channel = supabase
    .channel(`partie:${partieId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "parties_multijoueur",
        filter: `id=eq.${partieId}`,
      },
      (payload) => {
        const etat = payload.new.etat as EtatPartieMultijoueur;
        onEtatChange(etat);
      }
    )
    .subscribe();

  return channel;
}

export function arreterEcoute(channel: RealtimeChannel | null): void {
  if (channel) supabase.removeChannel(channel);
}
