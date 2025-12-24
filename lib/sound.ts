/**
 * Module de gestion des effets sonores
 * Gère la lecture des sons et les préférences audio
 */

import type { PreferencesSonores } from "@/types";

// Sons disponibles dans l'application
export const SONS = {
  BLAGUE_AFFICHEE: "/sounds/blague.wav",
  JOUEUR_ELIMINÉ: "/sounds/eliminated.wav",
  VICTOIRE: "/sounds/victory.wav",
  REFUS_BLAGUE: "/sounds/skip.wav",
  BOUTON_CLICK: "/sounds/click.wav",
  ERREUR: "/sounds/error.wav",
} as const;

let audioContext: AudioContext | null = null;
let audioCache: Map<string, AudioBuffer> = new Map();

/**
 * Initialise le contexte audio
 */
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Charge un fichier audio
 */
async function chargerAudio(url: string): Promise<AudioBuffer | null> {
  if (audioCache.has(url)) {
    return audioCache.get(url)!;
  }

  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const context = getAudioContext();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    audioCache.set(url, audioBuffer);
    return audioBuffer;
  } catch (error) {
    console.error(`Erreur lors du chargement du son ${url}:`, error);
    return null;
  }
}

/**
 * Joue un effet sonore
 */
export async function jouerSon(
  son: keyof typeof SONS,
  preferences: PreferencesSonores
): Promise<void> {
  if (!preferences.sonActif || preferences.volumeEffetsSonores === 0) {
    return;
  }

  try {
    const url = SONS[son];
    const audioBuffer = await chargerAudio(url);
    
    if (!audioBuffer) {
      return;
    }

    const context = getAudioContext();
    
    // Reprendre le contexte s'il est suspendu (requis sur certains navigateurs)
    if (context.state === 'suspended') {
      await context.resume();
    }

    const source = context.createBufferSource();
    const gainNode = context.createGain();
    
    source.buffer = audioBuffer;
    gainNode.gain.value = preferences.volumeEffetsSonores;
    
    source.connect(gainNode);
    gainNode.connect(context.destination);
    
    source.start(0);
  } catch (error) {
    console.error(`Erreur lors de la lecture du son ${son}:`, error);
  }
}

/**
 * Précharge tous les sons
 */
export async function prechargerSons(): Promise<void> {
  const urls = Object.values(SONS);
  await Promise.all(urls.map(url => chargerAudio(url)));
}

/**
 * Arrête tous les sons en cours
 */
export function arreterTousLesSons(): void {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
    audioCache.clear();
  }
}
