/**
 * Types pour l'application STRTS (Si Tu Ris Tu Sors!)
 * Tous les types sont en français pour correspondre au domaine métier
 */

// ========== TYPES DE DONNÉES (Blagues) ==========

/**
 * Structure brute d'une blague dans le JSON
 */
export interface BlagueJSON {
  image_url: string;
  title: string;
  text: string;
  category: string;
}

/**
 * Blague après transformation et typage
 * id est généré de manière stable à partir de imageUrl + titre + categorie
 */
export interface Blague {
  id: string;
  imageUrl: string;
  titre: string;
  texte: string;
  categorie: string;
}

// ========== TYPES DE JEU ==========

/**
 * Mode de sélection des catégories
 */
export type ModeCategorieType = "communes" | "parJoueur";

/**
 * Ordre des tours
 */
export type OrdreToursType = "inscription" | "aleatoire";

/**
 * Configuration de la partie (setup initial)
 */
export interface ConfigurationPartie {
  nomPartie: string;
  modeCategorie: ModeCategorieType;
  ordreTours: OrdreToursType;
  categoriesCommunes?: string[]; // Si modeCategorie === "communes"
}

/**
 * Joueur dans une partie
 */
export interface Joueur {
  id: string; // UUID généré
  nom: string;
  categoriesPreferees: string[]; // Utilisé si modeCategorie === "parJoueur"
  refusRestants: number; // Max 2, initialisé à 2
  estElimine: boolean;
  nbBlagues: number; // Stats: nombre de blagues lues
}

/**
 * État complet de la partie en cours
 */
export interface EtatPartie {
  configuration: ConfigurationPartie;
  joueurs: Joueur[];
  ordreJoueurs: string[]; // IDs des joueurs dans l'ordre des tours (fixé au démarrage)
  indexJoueurCourant: number; // Index dans ordreJoueurs
  blagues: Blague[]; // Toutes les blagues disponibles
  blaguesUtilisees: Set<string>; // IDs des blagues déjà vues
  blagueRefuseeId?: string; // Dernière blague refusée (pour éviter re-tirage immédiat)
  blagueActuelle?: Blague; // Blague en cours d'affichage
  estTerminee: boolean;
  gagnantId?: string;
  dateDebut: Date;
  dateFin?: Date;
}

/**
 * Résultat d'un tirage de blague
 */
export interface ResultatTirage {
  blague?: Blague;
  erreur?: "aucuneDisponible" | "pasDeCategories";
}

// ========== TYPES DE PERSISTANCE ==========

/**
 * Préférences sonores de l'application
 */
export interface PreferencesSonores {
  sonActif: boolean;
  volumeEffetsSonores: number; // 0 à 1
}

/**
 * Profil d'un joueur sauvegardé (localStorage)
 */
export interface ProfilJoueur {
  id: string;
  nom: string;
  categoriesPreferees: string[];
  nbPartiesJouees: number;
  lastUsedAt: Date;
}

/**
 * État de partie sérialisable pour localStorage
 * (Set converti en Array, Date en ISO string)
 */
export interface EtatPartieSauvegarde {
  configuration: ConfigurationPartie;
  joueurs: Joueur[];
  ordreJoueurs: string[];
  indexJoueurCourant: number;
  blagues: Blague[];
  blaguesUtilisees: string[]; // Array au lieu de Set
  blagueRefuseeId?: string;
  blagueActuelle?: Blague;
  estTerminee: boolean;
  gagnantId?: string;
  dateDebut: string; // ISO string
  dateFin?: string;
}

// ========== TYPES UI ==========

/**
 * Props pour les écrans de navigation
 */
export interface NavigationProps {
  onNext?: () => void;
  onBack?: () => void;
  onCancel?: () => void;
}

/**
 * Statistiques de fin de partie
 */
export interface StatistiquesPartie {
  gagnant: Joueur;
  nbBlaguesTotales: number;
  dureePartie: number; // en secondes
  joueurs: {
    joueur: Joueur;
    nbBlagues: number;
    nbRefus: number;
  }[];
}
