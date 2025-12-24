/**
 * Module de persistance localStorage
 * Gère la sauvegarde des profils joueurs et de l'état de la partie en cours
 */

import type { ProfilJoueur, EtatPartie, EtatPartieSauvegarde } from "@/types";

// Ré-exporter les types pour les utiliser ailleurs
export type { ProfilJoueur, EtatPartie, EtatPartieSauvegarde };

const CLE_PROFILS = "strts_profils_joueurs";
const CLE_PARTIE_EN_COURS = "strts_partie_en_cours";

// ========== PROFILS JOUEURS ==========

/**
 * Charge tous les profils joueurs depuis localStorage
 */
export function chargerProfilsJoueurs(): ProfilJoueur[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(CLE_PROFILS);
    if (!data) return [];

    const profils = JSON.parse(data);
    // Convertir les dates ISO en objets Date
    return profils.map((p: any) => ({
      ...p,
      lastUsedAt: new Date(p.lastUsedAt),
    }));
  } catch (error) {
    console.error("Erreur lors du chargement des profils:", error);
    return [];
  }
}

/**
 * Sauvegarde les profils joueurs
 */
export function sauvegarderProfilsJoueurs(profils: ProfilJoueur[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CLE_PROFILS, JSON.stringify(profils));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des profils:", error);
  }
}

/**
 * Ajoute ou met à jour un profil joueur
 */
export function sauvegarderProfilJoueur(profil: ProfilJoueur): void {
  const profils = chargerProfilsJoueurs();
  const index = profils.findIndex((p) => p.id === profil.id);

  if (index >= 0) {
    profils[index] = profil;
  } else {
    profils.push(profil);
  }

  sauvegarderProfilsJoueurs(profils);
}

/**
 * Recherche un profil par nom (insensible à la casse)
 */
export function rechercherProfilParNom(nom: string): ProfilJoueur | undefined {
  const profils = chargerProfilsJoueurs();
  return profils.find(
    (p) => p.nom.toLowerCase() === nom.toLowerCase()
  );
}

/**
 * Met à jour la dernière utilisation d'un profil
 */
export function mettreAJourDerniereUtilisation(id: string): void {
  const profils = chargerProfilsJoueurs();
  const profil = profils.find((p) => p.id === id);

  if (profil) {
    profil.lastUsedAt = new Date();
    sauvegarderProfilsJoueurs(profils);
  }
}

/**
 * Supprime un profil joueur
 */
export function supprimerProfilJoueur(id: string): void {
  const profils = chargerProfilsJoueurs();
  const profilsFiltres = profils.filter((p) => p.id !== id);
  sauvegarderProfilsJoueurs(profilsFiltres);
}

/**
 * Met à jour un profil joueur existant
 */
export function modifierProfilJoueur(id: string, modifications: Partial<Omit<ProfilJoueur, 'id'>>): void {
  const profils = chargerProfilsJoueurs();
  const index = profils.findIndex((p) => p.id === id);
  
  if (index >= 0) {
    profils[index] = {
      ...profils[index],
      ...modifications,
    };
    sauvegarderProfilsJoueurs(profils);
  }
}

// ========== PARTIE EN COURS ==========

/**
 * Convertit un EtatPartie en format sérialisable
 */
function serialiserEtatPartie(partie: EtatPartie): EtatPartieSauvegarde {
  return {
    configuration: partie.configuration,
    joueurs: partie.joueurs,
    ordreJoueurs: partie.ordreJoueurs,
    indexJoueurCourant: partie.indexJoueurCourant,
    blagues: partie.blagues,
    blaguesUtilisees: Array.from(partie.blaguesUtilisees),
    blagueRefuseeId: partie.blagueRefuseeId,
    blagueActuelle: partie.blagueActuelle,
    estTerminee: partie.estTerminee,
    gagnantId: partie.gagnantId,
    dateDebut: partie.dateDebut.toISOString(),
    dateFin: partie.dateFin?.toISOString(),
  };
}

/**
 * Convertit un EtatPartieSauvegarde en EtatPartie
 */
function deserialiserEtatPartie(sauvegarde: EtatPartieSauvegarde): EtatPartie {
  return {
    configuration: sauvegarde.configuration,
    joueurs: sauvegarde.joueurs,
    ordreJoueurs: sauvegarde.ordreJoueurs,
    indexJoueurCourant: sauvegarde.indexJoueurCourant,
    blagues: sauvegarde.blagues,
    blaguesUtilisees: new Set(sauvegarde.blaguesUtilisees),
    blagueRefuseeId: sauvegarde.blagueRefuseeId,
    blagueActuelle: sauvegarde.blagueActuelle,
    estTerminee: sauvegarde.estTerminee,
    gagnantId: sauvegarde.gagnantId,
    dateDebut: new Date(sauvegarde.dateDebut),
    dateFin: sauvegarde.dateFin ? new Date(sauvegarde.dateFin) : undefined,
  };
}

/**
 * Sauvegarde l'état de la partie en cours
 */
export function sauvegarderPartieEnCours(partie: EtatPartie): void {
  if (typeof window === "undefined") return;

  try {
    const sauvegarde = serialiserEtatPartie(partie);
    localStorage.setItem(CLE_PARTIE_EN_COURS, JSON.stringify(sauvegarde));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la partie:", error);
  }
}

/**
 * Charge l'état de la partie en cours
 */
export function chargerPartieEnCours(): EtatPartie | null {
  if (typeof window === "undefined") return null;

  try {
    const data = localStorage.getItem(CLE_PARTIE_EN_COURS);
    if (!data) return null;

    const sauvegarde: EtatPartieSauvegarde = JSON.parse(data);
    return deserialiserEtatPartie(sauvegarde);
  } catch (error) {
    console.error("Erreur lors du chargement de la partie:", error);
    return null;
  }
}

/**
 * Supprime la partie en cours
 */
export function supprimerPartieEnCours(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(CLE_PARTIE_EN_COURS);
  } catch (error) {
    console.error("Erreur lors de la suppression de la partie:", error);
  }
}

/**
 * Vérifie si une partie est en cours
 */
export function partieEnCoursExiste(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CLE_PARTIE_EN_COURS) !== null;
}
