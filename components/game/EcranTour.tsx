"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Eye, XCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Joueur } from "@/types";

interface EcranTourProps {
  joueurCourant: Joueur;
  joueursActifsCount: number;
  dureeTimerSecondes?: number;
  onJeSuisPret: () => void;
  onJeRisJeSors: () => void;
  onMenu: () => void;
}

export function EcranTour({
  joueurCourant,
  joueursActifsCount,
  dureeTimerSecondes,
  onJeSuisPret,
  onJeRisJeSors,
  onMenu,
}: EcranTourProps) {
  const [tempsRestant, setTempsRestant] = useState<number | null>(
    dureeTimerSecondes && dureeTimerSecondes > 0 ? dureeTimerSecondes : null
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!tempsRestant) return;
    intervalRef.current = setInterval(() => {
      setTempsRestant(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(intervalRef.current!);
          onJeSuisPret();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pctTimer = tempsRestant !== null && dureeTimerSecondes
    ? (tempsRestant / dureeTimerSecondes) * 100
    : null;

  return (
    <motion.div
      key="tour"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="min-h-screen flex flex-col items-center justify-center p-4"
    >
      <Button
        variant="ghost"
        onClick={onMenu}
        className="absolute top-4 right-4 text-white hover:bg-white/20"
        size="icon"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-6 h-6" aria-hidden="true" />
      </Button>

      <div className="max-w-2xl w-full text-center space-y-8">
        <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="text-white">
          <div className="text-sm opacity-80 mb-2">Au tour de</div>
          <h1 className="text-6xl font-black mb-4">{joueurCourant.nom}</h1>
          <div className="text-lg opacity-90">
            Joueurs restants : {joueursActifsCount}
          </div>
        </motion.div>

        {/* Timer visuel */}
        {tempsRestant !== null && pctTimer !== null && (
          <div className="space-y-2" role="timer" aria-label={`${tempsRestant} secondes restantes`}>
            <div className="text-white text-3xl font-black">{tempsRestant}s</div>
            <div className="w-full h-3 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${pctTimer}%` }}
              />
            </div>
          </div>
        )}

        <Card className="bg-white/95">
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 space-y-1">
              <div>Refus restants : <strong>{joueurCourant.refusRestants}</strong> / 2</div>
              <div>Blagues vues : <strong>{joueurCourant.nbBlagues}</strong></div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={onJeSuisPret}
          size="xl"
          className="w-full bg-green-500 hover:bg-green-600 text-2xl py-8"
          aria-label="Je suis prêt à lire ma blague"
        >
          <Eye className="w-8 h-8 mr-3" aria-hidden="true" />
          Je suis prêt !
        </Button>

        <Button
          onClick={onJeRisJeSors}
          variant="destructive"
          size="lg"
          className="w-full"
          aria-label="Signaler qui a ri"
        >
          <XCircle className="w-5 h-5 mr-2" aria-hidden="true" />
          Qui a ri ?
        </Button>
      </div>
    </motion.div>
  );
}
