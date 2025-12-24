/**
 * Module de chargement et gestion des blagues
 * Charge le fichier JSON, génère des IDs stables, et filtre les blagues invalides
 */

import blaguesJSON from "@/data/all_blagues.json";
import type { BlagueJSON, Blague } from "@/types";
import { createHash } from "crypto";

/**
 * Génère un ID stable pour une blague à partir de ses données
 * Utilise un hash MD5 de imageUrl + titre + categorie
 */
function genererIdBlague(imageUrl: string, titre: string, categorie: string): string {
  const data = `${imageUrl}|${titre}|${categorie}`;
  
  // En environnement serveur (Node.js), utiliser crypto
  if (typeof window === "undefined") {
    return createHash("md5").update(data).digest("hex");
  }
  
  // En environnement client, fallback sur un hash simple
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Transforme une blague du format JSON brut vers le format typé
 */
function transformerBlague(blagueJSON: BlagueJSON): Blague {
  const id = genererIdBlague(
    blagueJSON.image_url,
    blagueJSON.title,
    blagueJSON.category
  );

  return {
    id,
    imageUrl: blagueJSON.image_url,
    titre: blagueJSON.title,
    texte: blagueJSON.text,
    categorie: blagueJSON.category,
  };
}

/**
 * Charge toutes les blagues depuis le JSON
 * Filtre les blagues sans texte (MVP: on affiche uniquement celles avec du texte)
 */
export function chargerBlagues(): Blague[] {
  const blagues = (blaguesJSON as BlagueJSON[])
    .map(transformerBlague)
    .filter((blague) => blague.texte && blague.texte.trim().length > 0);

  return blagues;
}

/**
 * Récupère toutes les catégories uniques disponibles
 */
export function obtenirCategories(): string[] {
  const blagues = chargerBlagues();
  const categories = new Set(blagues.map((b) => b.categorie));
  return Array.from(categories).sort();
}

/**
 * Compte le nombre de blagues par catégorie
 */
export function compterBlaguesParCategorie(): Record<string, number> {
  const blagues = chargerBlagues();
  const compteurs: Record<string, number> = {};
  
  blagues.forEach((blague) => {
    compteurs[blague.categorie] = (compteurs[blague.categorie] || 0) + 1;
  });
  
  return compteurs;
}

/**
 * Filtre les blagues par catégories
 */
export function filtrerBlaguesParCategories(
  blagues: Blague[],
  categories: string[]
): Blague[] {
  return blagues.filter((b) => categories.includes(b.categorie));
}

/**
 * Récupère une blague par son ID
 */
export function obtenirBlagueParId(
  blagues: Blague[],
  id: string
): Blague | undefined {
  return blagues.find((b) => b.id === id);
}
