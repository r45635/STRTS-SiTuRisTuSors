"use client";

import { motion } from "framer-motion";
import { SkipForward, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Joueur } from "@/types";

interface EcranJeRisJeSorsProps {
  joueursActifs: Joueur[];
  joueursAEliminer: string[];
  onToggleJoueur: (id: string) => void;
  onConfirmer: () => void;
  onJoueurSuivant: () => void;
  onAnnuler: () => void;
  onMenu: () => void;
}

export function EcranJeRisJeSors({
  joueursActifs,
  joueursAEliminer,
  onToggleJoueur,
  onConfirmer,
  onJoueurSuivant,
  onAnnuler,
  onMenu,
}: EcranJeRisJeSorsProps) {
  return (
    <motion.div
      key="jeRisJeSors"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="min-h-screen flex items-center justify-center p-4 pt-20"
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

      <Card className="w-full max-w-md" role="dialog" aria-label="Qui a ri ?">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-center">😂 Qui a ri ?</CardTitle>
          <p className="text-center text-gray-600 text-sm">
            Sélectionnez le ou les joueurs
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          <div role="group" aria-label="Joueurs actifs — sélectionnez ceux qui ont ri">
            {joueursActifs.map(joueur => (
              <button
                key={joueur.id}
                onClick={() => onToggleJoueur(joueur.id)}
                aria-pressed={joueursAEliminer.includes(joueur.id)}
                className={`w-full p-2 rounded-lg border-2 text-left transition-all mb-1 ${
                  joueursAEliminer.includes(joueur.id)
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <p className="font-bold text-sm">{joueur.nom}</p>
                    <p className="text-xs text-gray-600">{joueur.nbBlagues} blagues</p>
                  </div>
                  {joueursAEliminer.includes(joueur.id) && (
                    <div className="text-xl" aria-hidden="true">😂</div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {joueursAEliminer.length === joueursActifs.length && (
            <div className="p-2 bg-yellow-50 border border-yellow-300 rounded text-xs text-center" role="alert">
              <p className="font-bold text-yellow-800">⚠️ Tous ont ri — Partie terminée</p>
            </div>
          )}

          {joueursAEliminer.length === joueursActifs.length - 1 && (
            <div className="p-2 bg-green-50 border border-green-300 rounded text-xs text-center" role="status">
              <p className="font-bold text-green-800">
                🎉 {joueursActifs.find(j => !joueursAEliminer.includes(j.id))?.nom} gagne
              </p>
            </div>
          )}

          <Button
            onClick={onJoueurSuivant}
            variant="outline"
            size="sm"
            className="w-full bg-white"
            aria-label="Personne n'a ri, passer au joueur suivant"
          >
            <SkipForward className="w-4 h-4 mr-2" aria-hidden="true" />
            Personne n&apos;a ri — Joueur suivant
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={onConfirmer}
              disabled={joueursAEliminer.length === 0}
              variant="destructive"
              size="sm"
              className="flex-1"
              aria-label={`Confirmer l'élimination de ${joueursAEliminer.length} joueur(s)`}
            >
              Confirmer ({joueursAEliminer.length})
            </Button>
            <Button
              onClick={onAnnuler}
              variant="outline"
              size="sm"
              className="flex-1"
              aria-label="Annuler"
            >
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
