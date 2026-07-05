"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EcranTour } from "@/components/game/EcranTour";
import { EcranRevelation } from "@/components/game/EcranRevelation";
import { EcranMenu } from "@/components/game/EcranMenu";
import { EcranEliminer } from "@/components/game/EcranEliminer";
import { EcranJeRisJeSors } from "@/components/game/EcranJeRisJeSors";
import { EcranVictoire } from "@/components/game/EcranVictoire";
import type { EtatPartie, PreferencesSonores } from "@/types";
import {
  obtenirJoueurCourant,
  tirerBlague,
  revelerBlague,
  refuserBlague,
  passerAuJoueurSuivant,
  eliminerJoueurs,
  recommencerPartie,
} from "@/lib/game";
import {
  chargerPartieEnCours,
  sauvegarderPartieEnCours,
  supprimerPartieEnCours,
  chargerPreferencesSonores,
} from "@/lib/storage";
import { jouerSon } from "@/lib/sound";

type EcranType = "tour" | "revelation" | "menu" | "eliminer" | "jeRisJeSors" | "victoire";

interface Alerte {
  titre: string;
  message: string;
}

export default function GamePage() {
  const router = useRouter();
  const [partie, setPartie] = useState<EtatPartie | null>(null);
  const [ecranActif, setEcranActif] = useState<EcranType>("tour");
  const [joueursAEliminer, setJoueursAEliminer] = useState<string[]>([]);
  const [preferencesSonores, setPreferencesSonores] = useState<PreferencesSonores>({
    sonActif: true,
    volumeEffetsSonores: 0.7,
  });
  const [alerte, setAlerte] = useState<Alerte | null>(null);

  useEffect(() => {
    setPreferencesSonores(chargerPreferencesSonores());
    const partieChargee = chargerPartieEnCours();
    if (!partieChargee) {
      router.push("/");
      return;
    }
    setPartie(partieChargee);
    if (partieChargee.estTerminee) setEcranActif("victoire");
  }, [router]);

  useEffect(() => {
    if (partie) {
      sauvegarderPartieEnCours(partie);
      if (partie.estTerminee && ecranActif !== "victoire") {
        setEcranActif("victoire");
      }
    }
  }, [partie, ecranActif]);

  const showAlerte = (titre: string, message: string) => setAlerte({ titre, message });

  const handleJeSuisPret = () => {
    if (!partie) return;
    const resultat = tirerBlague(partie);
    if (resultat.erreur === "aucuneDisponible") {
      jouerSon("ERREUR", preferencesSonores);
      showAlerte("Plus de blagues", "Plus de blagues disponibles ! Élargissez les catégories ou recommencez.");
      return;
    }
    if (resultat.erreur === "pasDeCategories") {
      jouerSon("ERREUR", preferencesSonores);
      showAlerte("Aucune catégorie", "Aucune catégorie sélectionnée pour ce joueur !");
      return;
    }
    if (resultat.blague) {
      jouerSon("BLAGUE_AFFICHEE", preferencesSonores);
      setPartie(revelerBlague(partie, resultat.blague));
      setEcranActif("revelation");
    }
  };

  const handleJoueurSuivant = () => {
    if (!partie) return;
    setPartie(passerAuJoueurSuivant(partie));
    setEcranActif("tour");
  };

  const handleRefuserBlague = () => {
    if (!partie) return;
    jouerSon("REFUS_BLAGUE", preferencesSonores);
    const nouvellePartie = refuserBlague(partie);
    setPartie(nouvellePartie);
    setEcranActif("tour");
    setTimeout(() => {
      const resultat = tirerBlague(nouvellePartie);
      if (resultat.erreur === "aucuneDisponible") {
        showAlerte("Plus de blagues", "Plus de blagues disponibles ! Élargissez les catégories ou recommencez.");
        return;
      }
      if (resultat.erreur === "pasDeCategories") {
        showAlerte("Aucune catégorie", "Aucune catégorie sélectionnée pour ce joueur !");
        return;
      }
      if (resultat.blague) {
        setPartie(revelerBlague(nouvellePartie, resultat.blague));
        setEcranActif("revelation");
      }
    }, 100);
  };

  const handleConfirmerJeRisJeSors = () => {
    if (!partie || joueursAEliminer.length === 0) return;
    jouerSon("JOUEUR_ELIMINÉ", preferencesSonores);
    const joueursActifs = partie.joueurs.filter(j => !j.estElimine);

    if (joueursAEliminer.length === joueursActifs.length) {
      setPartie({
        ...partie,
        joueurs: partie.joueurs.map(j => ({ ...j, estElimine: true })),
        estTerminee: true,
        gagnantId: undefined,
        dateFin: new Date(),
      });
      setJoueursAEliminer([]);
      return;
    }

    const nouvellePartie = eliminerJoueurs(partie, joueursAEliminer);
    setJoueursAEliminer([]);

    if (!nouvellePartie.estTerminee) {
      setPartie(passerAuJoueurSuivant(nouvellePartie));
      setEcranActif("tour");
    } else {
      jouerSon("VICTOIRE", preferencesSonores);
      setPartie(nouvellePartie);
    }
  };

  const handleEliminerJoueurs = () => {
    if (!partie || joueursAEliminer.length === 0) return;
    const nouvellePartie = eliminerJoueurs(partie, joueursAEliminer);
    setJoueursAEliminer([]);
    if (!nouvellePartie.estTerminee) {
      setPartie(passerAuJoueurSuivant(nouvellePartie));
      setEcranActif("tour");
    } else {
      setPartie(nouvellePartie);
    }
  };

  const handleRecommencer = () => {
    if (!partie) return;
    setPartie(recommencerPartie(partie));
    setEcranActif("tour");
  };

  const handleAbandonner = () => {
    supprimerPartieEnCours();
    router.push("/");
  };

  const toggleJoueur = (id: string) => {
    setJoueursAEliminer(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  if (!partie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
          <div className="text-white text-xl font-semibold" role="status">Chargement...</div>
        </div>
      </div>
    );
  }

  const joueurCourant = obtenirJoueurCourant(partie);
  const joueursActifs = partie.joueurs.filter(j => !j.estElimine);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
      {/* Barre d'état */}
      {ecranActif !== "victoire" && ecranActif !== "menu" && (
        <div className="fixed top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 text-sm z-50" aria-live="polite">
          <div className="font-bold text-purple-900">{joueurCourant?.nom || "En attente"}</div>
          <div className="text-gray-600 text-xs mt-1">
            {joueursActifs.length} joueur{joueursActifs.length > 1 ? "s" : ""} ·{" "}
            {partie.joueurs.filter(j => j.estElimine).length} éliminé{partie.joueurs.filter(j => j.estElimine).length > 1 ? "s" : ""}
          </div>
          {joueurCourant && (
            <div className="text-gray-600 text-xs">Refus : {joueurCourant.refusRestants}/2</div>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {ecranActif === "tour" && joueurCourant && (
          <EcranTour
            joueurCourant={joueurCourant}
            joueursActifsCount={joueursActifs.length}
            dureeTimerSecondes={partie.configuration.dureeTimerSecondes}
            onJeSuisPret={handleJeSuisPret}
            onJeRisJeSors={() => { setJoueursAEliminer([]); setEcranActif("jeRisJeSors"); }}
            onMenu={() => setEcranActif("menu")}
          />
        )}

        {ecranActif === "revelation" && partie.blagueActuelle && joueurCourant && (
          <EcranRevelation
            blagueActuelle={partie.blagueActuelle}
            joueurCourant={joueurCourant}
            onJoueurSuivant={handleJoueurSuivant}
            onJeRisJeSors={() => { setJoueursAEliminer([]); setEcranActif("jeRisJeSors"); }}
            onRefuserBlague={handleRefuserBlague}
            onMenu={() => setEcranActif("menu")}
          />
        )}

        {ecranActif === "menu" && (
          <EcranMenu
            hasBlagueActuelle={!!partie.blagueActuelle}
            onReprendre={() => setEcranActif(partie.blagueActuelle ? "revelation" : "tour")}
            onEliminer={() => { setJoueursAEliminer([]); setEcranActif("eliminer"); }}
            onRecommencer={handleRecommencer}
            onAbandonner={handleAbandonner}
          />
        )}

        {ecranActif === "eliminer" && (
          <EcranEliminer
            joueursActifs={joueursActifs}
            joueursAEliminer={joueursAEliminer}
            onToggleJoueur={toggleJoueur}
            onEliminer={handleEliminerJoueurs}
            onAnnuler={() => { setJoueursAEliminer([]); setEcranActif("menu"); }}
          />
        )}

        {ecranActif === "jeRisJeSors" && (
          <EcranJeRisJeSors
            joueursActifs={joueursActifs}
            joueursAEliminer={joueursAEliminer}
            onToggleJoueur={toggleJoueur}
            onConfirmer={handleConfirmerJeRisJeSors}
            onJoueurSuivant={() => { setJoueursAEliminer([]); handleJoueurSuivant(); }}
            onAnnuler={() => { setJoueursAEliminer([]); setEcranActif(partie.blagueActuelle ? "revelation" : "tour"); }}
            onMenu={() => setEcranActif("menu")}
          />
        )}

        {ecranActif === "victoire" && partie.estTerminee && (
          <EcranVictoire
            partie={partie}
            onRecommencer={handleRecommencer}
            onQuitter={handleAbandonner}
          />
        )}
      </AnimatePresence>

      {/* Dialog d'alerte générique */}
      <AlertDialog open={!!alerte} onOpenChange={(open) => !open && setAlerte(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alerte?.titre}</AlertDialogTitle>
            <AlertDialogDescription>{alerte?.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlerte(null)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
