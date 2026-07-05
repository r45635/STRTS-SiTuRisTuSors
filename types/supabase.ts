// Types générés pour Supabase — exécuter `npx supabase gen types typescript` après avoir lié votre projet
// Schema SQL de référence dans supabase/schema.sql

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      votes_blagues: {
        Row: {
          id: string;
          blague_id: string;
          user_id: string | null;
          vote: "up" | "down";
          created_at: string;
        };
        Insert: {
          id?: string;
          blague_id: string;
          user_id?: string | null;
          vote: "up" | "down";
          created_at?: string;
        };
        Update: {
          id?: string;
          blague_id?: string;
          user_id?: string | null;
          vote?: "up" | "down";
          created_at?: string;
        };
      };
      parties_multijoueur: {
        Row: {
          id: string;
          code: string;
          hote_id: string | null;
          etat: Json;
          statut: "attente" | "en_cours" | "terminee";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          hote_id?: string | null;
          etat: Json;
          statut?: "attente" | "en_cours" | "terminee";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          hote_id?: string | null;
          etat?: Json;
          statut?: "attente" | "en_cours" | "terminee";
          created_at?: string;
          updated_at?: string;
        };
      };
      joueurs_multijoueur: {
        Row: {
          id: string;
          partie_id: string;
          user_id: string | null;
          nom: string;
          est_hote: boolean;
          est_connecte: boolean;
          donnees: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          partie_id: string;
          user_id?: string | null;
          nom: string;
          est_hote?: boolean;
          est_connecte?: boolean;
          donnees?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          partie_id?: string;
          user_id?: string | null;
          nom?: string;
          est_hote?: boolean;
          est_connecte?: boolean;
          donnees?: Json;
          created_at?: string;
        };
      };
    };
  };
}
