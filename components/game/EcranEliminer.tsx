"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Joueur } from "@/types";

interface EcranEliminerProps {
  joueursActifs: Joueur[];
  joueursAEliminer: string[];
  onToggleJoueur: (id: string) => void;
  onEliminer: () => void;
  onAnnuler: () => void;
}

export function EcranEliminer({
  joueursActifs,
  joueursAEliminer,
  onToggleJoueur,
  onEliminer,
  onAnnuler,
}: EcranEliminerProps) {
  return (
    <motion.div
      key="eliminer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-md" role="dialog" aria-label="Sélection des joueurs à éliminer">
        <CardHeader>
          <CardTitle className="text-2xl">Éliminer des joueurs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div role="group" aria-label="Joueurs actifs">
            {joueursActifs.map(joueur => (
              <button
                key={joueur.id}
                onClick={() => onToggleJoueur(joueur.id)}
                aria-pressed={joueursAEliminer.includes(joueur.id)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all mb-2 ${
                  joueursAEliminer.includes(joueur.id)
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-bold">{joueur.nom}</div>
                <div className="text-sm text-gray-600">{joueur.nbBlagues} blagues vues</div>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onEliminer}
              disabled={joueursAEliminer.length === 0}
              variant="destructive"
              className="flex-1"
              aria-label={`Éliminer ${joueursAEliminer.length} joueur(s) sélectionné(s)`}
            >
              Éliminer ({joueursAEliminer.length})
            </Button>
            <Button
              onClick={onAnnuler}
              variant="outline"
              className="flex-1"
              aria-label="Annuler et retourner au menu"
            >
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
