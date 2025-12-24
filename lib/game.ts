/**
 * Game Engine pour STRTS (Si Tu Ris Tu Sors!)
 * Contient toute la logique métier du jeu de manière pure et testable
 */

import type {
  ConfigurationPartie,
  Joueur,
  EtatPartie,
  Blague,
  ResultatTirage,
} from "@/types";
import { filtrerBlaguesParCategories } from "./blagues";

/**
 * Génère un UUID simple (v4)
 */
function genererUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Mélange un tableau (algorithme Fisher-Yates)
 */
function melangerTableau<T>(tableau: T[]): T[] {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/**
 * Crée un joueur
 */
export function creerJoueur(
  nom: string,
  categoriesPreferees: string[] = []
): Joueur {
  return {
    id: genererUUID(),
    nom,
    categoriesPreferees,
    refusRestants: 2,
    estElimine: false,
    nbBlagues: 0,
  };
}

/**
 * Crée une nouvelle partie
 */
export function creerPartie(
  configuration: ConfigurationPartie,
  joueurs: Joueur[],
  toutesLesBlagues: Blague[]
): EtatPartie {
  if (joueurs.length < 2) {
    throw new Error("Il faut au moins 2 joueurs pour créer une partie");
  }

  // Déterminer l'ordre des joueurs
  let ordreJoueurs: string[];
  if (configuration.ordreTours === "aleatoire") {
    ordreJoueurs = melangerTableau(joueurs.map((j) => j.id));
  } else {
    ordreJoueurs = joueurs.map((j) => j.id);
  }

  return {
    configuration,
    joueurs,
    ordreJoueurs,
    indexJoueurCourant: 0,
    blagues: toutesLesBlagues,
    blaguesUtilisees: new Set<string>(),
    estTerminee: false,
    dateDebut: new Date(),
  };
}

/**
 * Récupère le joueur courant
 */
export function obtenirJoueurCourant(partie: EtatPartie): Joueur | undefined {
  const joueurId = partie.ordreJoueurs[partie.indexJoueurCourant];
  return partie.joueurs.find((j) => j.id === joueurId);
}

/**
 * Récupère les catégories autorisées pour un joueur
 */
function obtenirCategoriesAutorisees(
  partie: EtatPartie,
  joueur: Joueur
): string[] {
  if (partie.configuration.modeCategorie === "communes") {
    return partie.configuration.categoriesCommunes || [];
  } else {
    return joueur.categoriesPreferees;
  }
}

/**
 * Tire une blague au hasard pour le joueur courant
 * Respecte les règles: sans répétition, dans les catégories autorisées
 */
export function tirerBlague(partie: EtatPartie): ResultatTirage {
  const joueur = obtenirJoueurCourant(partie);
  if (!joueur) {
    return { erreur: "pasDeCategories" };
  }

  const categoriesAutorisees = obtenirCategoriesAutorisees(partie, joueur);
  if (categoriesAutorisees.length === 0) {
    return { erreur: "pasDeCategories" };
  }

  // Filtrer les blagues disponibles
  const blaguesCategories = filtrerBlaguesParCategories(
    partie.blagues,
    categoriesAutorisees
  );

  // Exclure les blagues déjà utilisées et la dernière refusée
  const blaguesDisponibles = blaguesCategories.filter(
    (b) =>
      !partie.blaguesUtilisees.has(b.id) &&
      b.id !== partie.blagueRefuseeId
  );

  if (blaguesDisponibles.length === 0) {
    return { erreur: "aucuneDisponible" };
  }

  // Tirer au hasard
  const index = Math.floor(Math.random() * blaguesDisponibles.length);
  const blague = blaguesDisponibles[index];

  return { blague };
}

/**
 * Révèle une blague tirée et l'ajoute à l'historique
 */
export function revelerBlague(partie: EtatPartie, blague: Blague): EtatPartie {
  const joueur = obtenirJoueurCourant(partie);
  if (!joueur) return partie;

  // Marquer la blague comme utilisée
  const nouvellesBlaguesUtilisees = new Set(partie.blaguesUtilisees);
  nouvellesBlaguesUtilisees.add(blague.id);

  // Incrémenter le compteur de blagues du joueur
  const nouveauxJoueurs = partie.joueurs.map((j) =>
    j.id === joueur.id ? { ...j, nbBlagues: j.nbBlagues + 1 } : j
  );

  return {
    ...partie,
    blaguesUtilisees: nouvellesBlaguesUtilisees,
    blagueActuelle: blague,
    blagueRefuseeId: undefined, // Reset la blague refusée
    joueurs: nouveauxJoueurs,
  };
}

/**
 * Refuse la blague actuelle (max 2 refus par joueur)
 * Décrémente refusRestants et permet un nouveau tirage
 */
export function refuserBlague(partie: EtatPartie): EtatPartie {
  const joueur = obtenirJoueurCourant(partie);
  if (!joueur || joueur.refusRestants <= 0 || !partie.blagueActuelle) {
    return partie;
  }

  // Décrémenter refusRestants
  const nouveauxJoueurs = partie.joueurs.map((j) =>
    j.id === joueur.id
      ? { ...j, refusRestants: j.refusRestants - 1, nbBlagues: j.nbBlagues - 1 }
      : j
  );

  // Retirer la blague actuelle des utilisées (elle peut ressortir plus tard)
  const nouvellesBlaguesUtilisees = new Set(partie.blaguesUtilisees);
  nouvellesBlaguesUtilisees.delete(partie.blagueActuelle.id);

  return {
    ...partie,
    joueurs: nouveauxJoueurs,
    blaguesUtilisees: nouvellesBlaguesUtilisees,
    blagueRefuseeId: partie.blagueActuelle.id, // Éviter re-tirage immédiat
    blagueActuelle: undefined,
  };
}

/**
 * Passe au joueur suivant (non éliminé)
 */
export function passerAuJoueurSuivant(partie: EtatPartie): EtatPartie {
  const joueursActifs = partie.joueurs.filter((j) => !j.estElimine);
  
  if (joueursActifs.length <= 1) {
    // Partie terminée
    const gagnant = joueursActifs[0];
    return {
      ...partie,
      estTerminee: true,
      gagnantId: gagnant?.id,
      dateFin: new Date(),
      blagueActuelle: undefined,
    };
  }

  // Trouver le prochain joueur actif
  let nouvelIndex = (partie.indexJoueurCourant + 1) % partie.ordreJoueurs.length;
  let tentatives = 0;

  while (tentatives < partie.ordreJoueurs.length) {
    const joueurId = partie.ordreJoueurs[nouvelIndex];
    const joueur = partie.joueurs.find((j) => j.id === joueurId);
    
    if (joueur && !joueur.estElimine) {
      break;
    }

    nouvelIndex = (nouvelIndex + 1) % partie.ordreJoueurs.length;
    tentatives++;
  }

  return {
    ...partie,
    indexJoueurCourant: nouvelIndex,
    blagueActuelle: undefined,
    blagueRefuseeId: undefined,
  };
}

/**
 * Élimine un ou plusieurs joueurs
 */
export function eliminerJoueurs(
  partie: EtatPartie,
  idsJoueurs: string[]
): EtatPartie {
  const nouveauxJoueurs = partie.joueurs.map((j) =>
    idsJoueurs.includes(j.id) ? { ...j, estElimine: true } : j
  );

  const joueursActifs = nouveauxJoueurs.filter((j) => !j.estElimine);

  // Si le joueur courant est éliminé, passer au suivant
  const joueurCourant = obtenirJoueurCourant(partie);
  const joueurCourantElimine =
    joueurCourant && idsJoueurs.includes(joueurCourant.id);

  let partieModifiee: EtatPartie = {
    ...partie,
    joueurs: nouveauxJoueurs,
  };

  // Vérifier fin de partie
  if (joueursActifs.length <= 1) {
    const gagnant = joueursActifs[0];
    return {
      ...partieModifiee,
      estTerminee: true,
      gagnantId: gagnant?.id,
      dateFin: new Date(),
      blagueActuelle: undefined,
    };
  }

  // Si joueur courant éliminé, passer au suivant
  if (joueurCourantElimine) {
    partieModifiee = passerAuJoueurSuivant(partieModifiee);
  }

  return partieModifiee;
}

/**
 * Recommence la partie avec les mêmes joueurs
 */
export function recommencerPartie(partie: EtatPartie): EtatPartie {
  // Réinitialiser les joueurs
  const joueursReinitialises = partie.joueurs.map((j) => ({
    ...j,
    refusRestants: 2,
    estElimine: false,
    nbBlagues: 0,
  }));

  // Re-déterminer l'ordre si aléatoire
  let ordreJoueurs: string[];
  if (partie.configuration.ordreTours === "aleatoire") {
    ordreJoueurs = melangerTableau(joueursReinitialises.map((j) => j.id));
  } else {
    ordreJoueurs = partie.ordreJoueurs;
  }

  return {
    ...partie,
    joueurs: joueursReinitialises,
    ordreJoueurs,
    indexJoueurCourant: 0,
    blaguesUtilisees: new Set<string>(),
    blagueRefuseeId: undefined,
    blagueActuelle: undefined,
    estTerminee: false,
    gagnantId: undefined,
    dateDebut: new Date(),
    dateFin: undefined,
  };
}

/**
 * Récupère les statistiques de la partie
 */
export function obtenirStatistiques(partie: EtatPartie) {
  const gagnant = partie.joueurs.find((j) => j.id === partie.gagnantId);
  if (!gagnant) return null;

  const dureeMs = partie.dateFin
    ? partie.dateFin.getTime() - partie.dateDebut.getTime()
    : 0;
  const dureePartie = Math.floor(dureeMs / 1000);

  const joueurs = partie.joueurs.map((joueur) => ({
    joueur,
    nbBlagues: joueur.nbBlagues,
    nbRefus: 2 - joueur.refusRestants,
  }));

  return {
    gagnant,
    nbBlaguesTotales: partie.blaguesUtilisees.size,
    dureePartie,
    joueurs,
  };
}
