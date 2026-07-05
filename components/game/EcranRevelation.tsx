"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SkipForward, XCircle, Menu, ThumbsUp, ThumbsDown } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Blague, Joueur } from "@/types";
import { obtenirVotes, voterPourBlague, type VoteBlague } from "@/lib/votes";

interface EcranRevelationProps {
  blagueActuelle: Blague;
  joueurCourant: Joueur;
  onJoueurSuivant: () => void;
  onJeRisJeSors: () => void;
  onRefuserBlague: () => void;
  onMenu: () => void;
}

export function EcranRevelation({
  blagueActuelle,
  joueurCourant,
  onJoueurSuivant,
  onJeRisJeSors,
  onRefuserBlague,
  onMenu,
}: EcranRevelationProps) {
  const [votes, setVotes] = useState<VoteBlague>({ up: 0, down: 0 });
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setVotes(obtenirVotes(blagueActuelle.id));
    setImageError(false);
  }, [blagueActuelle.id]);

  const handleVote = (type: "up" | "down") => {
    const nouveau = voterPourBlague(blagueActuelle.id, type);
    setVotes(nouveau);
  };

  return (
    <motion.div
      key="revelation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-3 pt-16 pb-6"
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

      <div className="max-w-2xl w-full space-y-4">
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="w-full bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-3 text-center border-b border-gray-200">
            <h2 className="text-lg font-bold text-purple-900">{blagueActuelle.titre}</h2>
          </div>

          {blagueActuelle.imageUrl && !imageError && (
            <div className="w-full flex justify-center bg-gray-100 py-3">
              <Image
                src={blagueActuelle.imageUrl}
                alt={blagueActuelle.titre}
                width={400}
                height={300}
                className="object-contain max-h-[44vh] w-auto"
                onError={() => setImageError(true)}
                unoptimized
              />
            </div>
          )}

          <div className="p-3 text-center">
            <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
              {blagueActuelle.texte}
            </p>
            <div className="mt-2 text-xs text-gray-500">{blagueActuelle.categorie}</div>

            {/* Votes */}
            <div className="mt-3 flex items-center justify-center gap-4" aria-label="Voter pour cette blague">
              <button
                onClick={() => handleVote("up")}
                aria-label={`Bonne blague — ${votes.up} vote(s)`}
                aria-pressed={votes.monVote === "up"}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  votes.monVote === "up"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-green-50"
                }`}
              >
                <ThumbsUp className="w-4 h-4" aria-hidden="true" />
                {votes.up}
              </button>
              <button
                onClick={() => handleVote("down")}
                aria-label={`Mauvaise blague — ${votes.down} vote(s)`}
                aria-pressed={votes.monVote === "down"}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  votes.monVote === "down"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-red-50"
                }`}
              >
                <ThumbsDown className="w-4 h-4" aria-hidden="true" />
                {votes.down}
              </button>
            </div>

            {joueurCourant.refusRestants > 0 && (
              <Button
                onClick={onRefuserBlague}
                variant="outline"
                size="sm"
                className="w-full mt-3 bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100"
                aria-label={`Refuser cette blague, ${joueurCourant.refusRestants} refus restants`}
              >
                <XCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                Refuser cette blague ({joueurCourant.refusRestants})
              </Button>
            )}
          </div>
        </motion.div>

        <div className="flex gap-3">
          <Button
            onClick={onJoueurSuivant}
            className="flex-1 py-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg"
            size="lg"
            aria-label="Passer au joueur suivant"
          >
            <SkipForward className="w-5 h-5 mr-2" aria-hidden="true" />
            Joueur suivant
          </Button>

          <Button
            onClick={onJeRisJeSors}
            className="flex-1 py-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold shadow-lg"
            size="lg"
            aria-label="Signaler qui a ri"
          >
            <XCircle className="w-5 h-5 mr-2" aria-hidden="true" />
            Qui a ri ?
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
