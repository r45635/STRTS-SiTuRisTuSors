"use client";

import { motion } from "framer-motion";
import { RotateCcw, Home } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { obtenirStatistiques } from "@/lib/game";
import type { EtatPartie } from "@/types";

const COLORS = ["#8b5cf6", "#ec4899", "#f97316", "#06b6d4", "#10b981", "#f59e0b"];

interface EcranVictoireProps {
  partie: EtatPartie;
  onRecommencer: () => void;
  onQuitter: () => void;
}

export function EcranVictoire({ partie, onRecommencer, onQuitter }: EcranVictoireProps) {
  const stats = obtenirStatistiques(partie);
  const toutLeMondeARi = !partie.gagnantId && partie.estTerminee;

  const donneesGraphique = stats
    ? stats.joueurs
        .sort((a, b) => b.nbBlagues - a.nbBlagues)
        .map((j, i) => ({
          nom: j.joueur.nom.length > 8 ? j.joueur.nom.slice(0, 8) + "…" : j.joueur.nom,
          blagues: j.nbBlagues,
          gagnant: stats.gagnant?.id === j.joueur.id,
          color: COLORS[i % COLORS.length],
        }))
    : [];

  return (
    <motion.div
      key="victoire"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="max-w-2xl w-full space-y-6">
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="text-center text-white"
        >
          {toutLeMondeARi ? (
            <>
              <h1 className="text-7xl font-black mb-4" aria-hidden="true">😂</h1>
              <h2 className="text-5xl font-black mb-2">Partie terminée !</h2>
              <p className="text-2xl opacity-90 mt-2" role="status">
                Tout le monde a ri, personne ne gagne !
              </p>
            </>
          ) : stats?.gagnant ? (
            <>
              <h1 className="text-7xl font-black mb-4" aria-hidden="true">🎉</h1>
              <h2 className="text-5xl font-black mb-2">Victoire !</h2>
              <p className="text-3xl font-bold" role="status" aria-live="polite">
                {stats.gagnant.nom}
              </p>
              <p className="text-xl opacity-90 mt-2">a gagné la partie !</p>
            </>
          ) : null}
        </motion.div>

        {stats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Chiffres clés */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600" aria-label={`${stats.nbBlaguesTotales} blagues vues`}>
                    {stats.nbBlaguesTotales}
                  </div>
                  <div className="text-sm text-gray-600">Blagues vues</div>
                </div>
                <div className="p-4 bg-pink-50 rounded-lg">
                  <div className="text-3xl font-bold text-pink-600" aria-label={`Durée ${Math.floor(stats.dureePartie / 60)} minutes ${stats.dureePartie % 60} secondes`}>
                    {Math.floor(stats.dureePartie / 60)}:{(stats.dureePartie % 60).toString().padStart(2, "0")}
                  </div>
                  <div className="text-sm text-gray-600">Durée</div>
                </div>
              </div>

              {/* Graphique blagues par joueur */}
              {donneesGraphique.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Blagues par joueur</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={donneesGraphique} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <XAxis dataKey="nom" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip
                        formatter={(value) => [`${value ?? 0} blagues`, "Blagues"]}
                        labelFormatter={(label) => label}
                      />
                      <Bar dataKey="blagues" radius={[4, 4, 0, 0]}>
                        {donneesGraphique.map((entry, index) => (
                          <Cell key={index} fill={entry.gagnant ? "#f59e0b" : entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Classement */}
              <div>
                <div className="font-bold mb-2">Classement :</div>
                <ol className="space-y-2" aria-label="Classement des joueurs">
                  {stats.joueurs
                    .sort((a, b) => b.nbBlagues - a.nbBlagues)
                    .map((j, index) => (
                      <li
                        key={j.joueur.id}
                        className={`p-3 rounded-lg ${
                          stats.gagnant?.id === j.joueur.id
                            ? "bg-yellow-100 border-2 border-yellow-400"
                            : j.joueur.estElimine
                            ? "bg-red-50"
                            : "bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-bold">
                              {index + 1}. {j.joueur.nom}
                            </span>
                            {stats.gagnant?.id === j.joueur.id && (
                              <span aria-label="gagnant"> 👑</span>
                            )}
                            {j.joueur.estElimine && (
                              <span aria-label="éliminé"> 😂</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {j.nbBlagues} blagues · {j.nbRefus} refus
                          </div>
                        </div>
                      </li>
                    ))}
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <Button
            onClick={onRecommencer}
            size="xl"
            className="w-full bg-green-500 hover:bg-green-600"
            aria-label="Rejouer une nouvelle partie avec les mêmes joueurs"
          >
            <RotateCcw className="w-6 h-6 mr-2" aria-hidden="true" />
            Rejouer
          </Button>
          <Button
            onClick={onQuitter}
            size="xl"
            variant="outline"
            className="w-full bg-white"
            aria-label="Retourner à l'accueil"
          >
            <Home className="w-6 h-6 mr-2" aria-hidden="true" />
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
