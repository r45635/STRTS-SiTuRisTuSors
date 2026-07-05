import type { Blague } from "@/types";

const BLAGUES_CUSTOM_KEY = "strts_blagues_custom";
export const CATEGORIE_CUSTOM = "mes blagues";

export interface BlagueCustomInput {
  titre: string;
  texte: string;
  categorie?: string;
}

function genererIdCustom(): string {
  return "custom_" + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function chargerBlaguesCustom(): Blague[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BLAGUES_CUSTOM_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function ajouterBlagueCustom(input: BlagueCustomInput): Blague {
  const blague: Blague = {
    id: genererIdCustom(),
    imageUrl: "",
    titre: input.titre.trim(),
    texte: input.texte.trim(),
    categorie: input.categorie?.trim() || CATEGORIE_CUSTOM,
  };
  const existantes = chargerBlaguesCustom();
  localStorage.setItem(BLAGUES_CUSTOM_KEY, JSON.stringify([...existantes, blague]));
  return blague;
}

export function supprimerBlagueCustom(id: string): void {
  const existantes = chargerBlaguesCustom();
  localStorage.setItem(
    BLAGUES_CUSTOM_KEY,
    JSON.stringify(existantes.filter(b => b.id !== id))
  );
}

export function modifierBlagueCustom(id: string, modifications: Partial<BlagueCustomInput>): void {
  const existantes = chargerBlaguesCustom();
  const mises_a_jour = existantes.map(b => {
    if (b.id !== id) return b;
    return {
      ...b,
      titre: modifications.titre?.trim() ?? b.titre,
      texte: modifications.texte?.trim() ?? b.texte,
      categorie: modifications.categorie?.trim() ?? b.categorie,
    };
  });
  localStorage.setItem(BLAGUES_CUSTOM_KEY, JSON.stringify(mises_a_jour));
}
