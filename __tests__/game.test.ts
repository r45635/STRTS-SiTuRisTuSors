/**
 * Tests unitaires pour le game engine
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  creerJoueur,
  creerPartie,
  obtenirJoueurCourant,
  tirerBlague,
  revelerBlague,
  refuserBlague,
  passerAuJoueurSuivant,
  eliminerJoueurs,
  recommencerPartie,
} from "../lib/game";
import type { Blague, ConfigurationPartie, EtatPartie } from "../types";

// Blagues de test
const blaguesTest: Blague[] = [
  {
    id: "1",
    imageUrl: "http://test.com/1.jpg",
    titre: "Blague 1",
    texte: "Texte 1",
    categorie: "tonton",
  },
  {
    id: "2",
    imageUrl: "http://test.com/2.jpg",
    titre: "Blague 2",
    texte: "Texte 2",
    categorie: "tonton",
  },
  {
    id: "3",
    imageUrl: "http://test.com/3.jpg",
    titre: "Blague 3",
    texte: "Texte 3",
    categorie: "autre",
  },
];

describe("Game Engine - Création", () => {
  it("devrait créer un joueur avec les bonnes propriétés", () => {
    const joueur = creerJoueur("Alice", ["tonton"]);
    
    expect(joueur.nom).toBe("Alice");
    expect(joueur.categoriesPreferees).toEqual(["tonton"]);
    expect(joueur.refusRestants).toBe(2);
    expect(joueur.estElimine).toBe(false);
    expect(joueur.nbBlagues).toBe(0);
    expect(joueur.id).toBeDefined();
  });

  it("devrait créer une partie avec ordre d'inscription", () => {
    const joueur1 = creerJoueur("Alice");
    const joueur2 = creerJoueur("Bob");
    
    const config: ConfigurationPartie = {
      nomPartie: "Test",
      modeCategorie: "communes",
      ordreTours: "inscription",
      categoriesCommunes: ["tonton"],
    };

    const partie = creerPartie(config, [joueur1, joueur2], blaguesTest);

    expect(partie.joueurs).toHaveLength(2);
    expect(partie.ordreJoueurs).toEqual([joueur1.id, joueur2.id]);
    expect(partie.indexJoueurCourant).toBe(0);
    expect(partie.estTerminee).toBe(false);
  });

  it("devrait mélanger l'ordre avec ordreTours aléatoire", () => {
    const joueurs = [
      creerJoueur("Alice"),
      creerJoueur("Bob"),
      creerJoueur("Charlie"),
    ];
    
    const config: ConfigurationPartie = {
      nomPartie: "Test",
      modeCategorie: "communes",
      ordreTours: "aleatoire",
      categoriesCommunes: ["tonton"],
    };

    // Créer plusieurs parties et vérifier qu'au moins une est différente
    const ordres = new Set();
    for (let i = 0; i < 10; i++) {
      const partie = creerPartie(config, joueurs, blaguesTest);
      ordres.add(partie.ordreJoueurs.join(","));
    }

    // Avec 3 joueurs, il devrait y avoir au moins 2 ordres différents sur 10 essais
    expect(ordres.size).toBeGreaterThan(1);
  });

  it("devrait lever une erreur avec moins de 2 joueurs", () => {
    const joueur1 = creerJoueur("Alice");
    
    const config: ConfigurationPartie = {
      nomPartie: "Test",
      modeCategorie: "communes",
      ordreTours: "inscription",
      categoriesCommunes: ["tonton"],
    };

    expect(() => creerPartie(config, [joueur1], blaguesTest)).toThrow();
  });
});

describe("Game Engine - Tirage de blagues", () => {
  let partie: EtatPartie;

  beforeEach(() => {
    const joueur1 = creerJoueur("Alice");
    const joueur2 = creerJoueur("Bob");
    
    const config: ConfigurationPartie = {
      nomPartie: "Test",
      modeCategorie: "communes",
      ordreTours: "inscription",
      categoriesCommunes: ["tonton"],
    };

    partie = creerPartie(config, [joueur1, joueur2], blaguesTest);
  });

  it("devrait tirer une blague valide", () => {
    const resultat = tirerBlague(partie);
    
    expect(resultat.blague).toBeDefined();
    expect(resultat.blague?.categorie).toBe("tonton");
    expect(resultat.erreur).toBeUndefined();
  });

  it("ne devrait pas tirer deux fois la même blague", () => {
    const resultat1 = tirerBlague(partie);
    expect(resultat1.blague).toBeDefined();
    
    partie = revelerBlague(partie, resultat1.blague!);
    
    const resultat2 = tirerBlague(partie);
    expect(resultat2.blague).toBeDefined();
    expect(resultat2.blague?.id).not.toBe(resultat1.blague?.id);
  });

  it("devrait retourner une erreur quand il n'y a plus de blagues", () => {
    // Marquer toutes les blagues de la catégorie comme utilisées
    partie.blaguesUtilisees.add("1");
    partie.blaguesUtilisees.add("2");
    
    const resultat = tirerBlague(partie);
    expect(resultat.erreur).toBe("aucuneDisponible");
  });

  it("devrait retourner une erreur sans catégories", () => {
    partie.configuration.categoriesCommunes = [];
    
    const resultat = tirerBlague(partie);
    expect(resultat.erreur).toBe("pasDeCategories");
  });
});

describe("Game Engine - Refus de blagues", () => {
  let partie: EtatPartie;
  let joueur1Id: string;

  beforeEach(() => {
    const joueur1 = creerJoueur("Alice");
    const joueur2 = creerJoueur("Bob");
    joueur1Id = joueur1.id;
    
    const config: ConfigurationPartie = {
      nomPartie: "Test",
      modeCategorie: "communes",
      ordreTours: "inscription",
      categoriesCommunes: ["tonton"],
    };

    partie = creerPartie(config, [joueur1, joueur2], blaguesTest);
    
    // Tirer et révéler une blague
    const resultat = tirerBlague(partie);
    partie = revelerBlague(partie, resultat.blague!);
  });

  it("devrait permettre de refuser une blague", () => {
    const partieAvant = partie;
    partie = refuserBlague(partie);
    
    const joueur = partie.joueurs.find(j => j.id === joueur1Id);
    expect(joueur?.refusRestants).toBe(1);
    expect(partie.blagueRefuseeId).toBe(partieAvant.blagueActuelle?.id);
  });

  it("devrait limiter les refus à 2 maximum", () => {
    // Premier refus
    partie = refuserBlague(partie);
    let joueur = partie.joueurs.find(j => j.id === joueur1Id);
    expect(joueur?.refusRestants).toBe(1);
    
    // Tirer une nouvelle blague
    const resultat = tirerBlague(partie);
    partie = revelerBlague(partie, resultat.blague!);
    
    // Deuxième refus
    partie = refuserBlague(partie);
    joueur = partie.joueurs.find(j => j.id === joueur1Id);
    expect(joueur?.refusRestants).toBe(0);
    
    // Tirer une nouvelle blague
    const resultat2 = tirerBlague(partie);
    partie = revelerBlague(partie, resultat2.blague!);
    
    // Troisième refus (ne devrait rien faire)
    const partieAvant = partie;
    partie = refuserBlague(partie);
    joueur = partie.joueurs.find(j => j.id === joueur1Id);
    expect(joueur?.refusRestants).toBe(0);
    expect(partie).toEqual(partieAvant);
  });
});

describe("Game Engine - Navigation", () => {
  let partie: EtatPartie;

  beforeEach(() => {
    const joueur1 = creerJoueur("Alice");
    const joueur2 = creerJoueur("Bob");
    const joueur3 = creerJoueur("Charlie");
    
    const config: ConfigurationPartie = {
      nomPartie: "Test",
      modeCategorie: "communes",
      ordreTours: "inscription",
      categoriesCommunes: ["tonton"],
    };

    partie = creerPartie(config, [joueur1, joueur2, joueur3], blaguesTest);
  });

  it("devrait passer au joueur suivant", () => {
    const joueur1 = obtenirJoueurCourant(partie);
    partie = passerAuJoueurSuivant(partie);
    const joueur2 = obtenirJoueurCourant(partie);
    
    expect(joueur2?.id).not.toBe(joueur1?.id);
  });

  it("devrait boucler au premier joueur après le dernier", () => {
    const joueur1 = obtenirJoueurCourant(partie);
    
    partie = passerAuJoueurSuivant(partie); // -> joueur2
    partie = passerAuJoueurSuivant(partie); // -> joueur3
    partie = passerAuJoueurSuivant(partie); // -> joueur1
    
    const joueurFinal = obtenirJoueurCourant(partie);
    expect(joueurFinal?.id).toBe(joueur1?.id);
  });

  it("devrait sauter les joueurs éliminés", () => {
    const joueur2Id = partie.ordreJoueurs[1];
    
    // Éliminer le joueur 2
    partie = eliminerJoueurs(partie, [joueur2Id]);
    
    const joueur1 = obtenirJoueurCourant(partie);
    partie = passerAuJoueurSuivant(partie);
    const joueur3 = obtenirJoueurCourant(partie);
    
    // Ne devrait pas être le joueur 2
    expect(joueur3?.id).not.toBe(joueur2Id);
    expect(joueur3?.id).not.toBe(joueur1?.id);
  });
});

describe("Game Engine - Élimination", () => {
  let partie: EtatPartie;

  beforeEach(() => {
    const joueur1 = creerJoueur("Alice");
    const joueur2 = creerJoueur("Bob");
    const joueur3 = creerJoueur("Charlie");
    
    const config: ConfigurationPartie = {
      nomPartie: "Test",
      modeCategorie: "communes",
      ordreTours: "inscription",
      categoriesCommunes: ["tonton"],
    };

    partie = creerPartie(config, [joueur1, joueur2, joueur3], blaguesTest);
  });

  it("devrait éliminer un joueur", () => {
    const joueurAEliminer = partie.joueurs[0];
    partie = eliminerJoueurs(partie, [joueurAEliminer.id]);
    
    const joueur = partie.joueurs.find(j => j.id === joueurAEliminer.id);
    expect(joueur?.estElimine).toBe(true);
  });

  it("devrait terminer la partie quand il reste 1 joueur", () => {
    const joueur1 = partie.joueurs[0];
    const joueur2 = partie.joueurs[1];
    
    partie = eliminerJoueurs(partie, [joueur1.id, joueur2.id]);
    
    expect(partie.estTerminee).toBe(true);
    expect(partie.gagnantId).toBe(partie.joueurs[2].id);
  });

  it("ne devrait pas terminer la partie s'il reste 2 joueurs", () => {
    const joueur1 = partie.joueurs[0];
    
    partie = eliminerJoueurs(partie, [joueur1.id]);
    
    expect(partie.estTerminee).toBe(false);
  });
});

describe("Game Engine - Recommencer", () => {
  it("devrait réinitialiser la partie", () => {
    const joueur1 = creerJoueur("Alice");
    const joueur2 = creerJoueur("Bob");
    
    const config: ConfigurationPartie = {
      nomPartie: "Test",
      modeCategorie: "communes",
      ordreTours: "inscription",
      categoriesCommunes: ["tonton"],
    };

    let partie = creerPartie(config, [joueur1, joueur2], blaguesTest);
    
    // Jouer un peu
    const resultat = tirerBlague(partie);
    partie = revelerBlague(partie, resultat.blague!);
    partie = eliminerJoueurs(partie, [joueur1.id]);
    
    // Recommencer
    partie = recommencerPartie(partie);
    
    expect(partie.estTerminee).toBe(false);
    expect(partie.blaguesUtilisees.size).toBe(0);
    expect(partie.joueurs[0].estElimine).toBe(false);
    expect(partie.joueurs[1].estElimine).toBe(false);
    expect(partie.joueurs[0].refusRestants).toBe(2);
    expect(partie.joueurs[1].refusRestants).toBe(2);
  });
});
