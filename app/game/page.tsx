"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  SkipForward,
  XCircle,
  Menu,
  Home,
  RotateCcw,
  UserMinus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EtatPartie, Blague, Joueur, PreferencesSonores } from "@/types";
import {
  obtenirJoueurCourant,
  tirerBlague,
  revelerBlague,
  refuserBlague,
  passerAuJoueurSuivant,
  eliminerJoueurs,
  recommencerPartie,
  obtenirStatistiques,
} from "@/lib/game";
import {
  chargerPartieEnCours,
  sauvegarderPartieEnCours,
  supprimerPartieEnCours,
  chargerPreferencesSonores,
} from "@/lib/storage";
import { jouerSon } from "@/lib/sound";

type EcranType = "tour" | "revelation" | "menu" | "eliminer" | "jeRisJeSors" | "victoire";

export default function GamePage() {
  const router = useRouter();
  const [partie, setPartie] = useState<EtatPartie | null>(null);
  const [ecranActif, setEcranActif] = useState<EcranType>("tour");
  const [joueursAEliminer, setJoueursAEliminer] = useState<string[]>([]);
  const [preferencesSonores, setPreferencesSonores] = useState<PreferencesSonores>({
    sonActif: true,
    volumeEffetsSonores: 0.7,
  });

  useEffect(() => {
    setPreferencesSonores(chargerPreferencesSonores());
    const partieChargee = chargerPartieEnCours();
    if (!partieChargee) {
      router.push("/");
      return;
    }
    setPartie(partieChargee);
    
    // Si la partie est terminée, aller direct à la victoire
    if (partieChargee.estTerminee) {
      setEcranActif("victoire");
    }
  }, [router]);

  useEffect(() => {
    if (partie) {
      sauvegarderPartieEnCours(partie);
      
      // Vérifier si la partie est terminée
      if (partie.estTerminee && ecranActif !== "victoire") {
        setEcranActif("victoire");
      }
    }
  }, [partie, ecranActif]);

  const handleJeSuisPret = () => {
    if (!partie) return;

    const resultat = tirerBlague(partie);
    
    if (resultat.erreur === "aucuneDisponible") {
      jouerSon("ERREUR", preferencesSonores);
      alert("Plus de blagues disponibles ! Veuillez élargir les catégories ou recommencer.");
      return;
    }
    
    if (resultat.erreur === "pasDeCategories") {
      jouerSon("ERREUR", preferencesSonores);
      alert("Aucune catégorie sélectionnée pour ce joueur !");
      return;
    }

    if (resultat.blague) {
      jouerSon("BLAGUE_AFFICHEE", preferencesSonores);
      const nouvellePartie = revelerBlague(partie, resultat.blague);
      setPartie(nouvellePartie);
      setEcranActif("revelation");
    }
  };

  const handleJoueurSuivant = () => {
    if (!partie) return;
    const nouvellePartie = passerAuJoueurSuivant(partie);
    setPartie(nouvellePartie);
    setEcranActif("tour");
  };

  const handleRefuserBlague = () => {
    if (!partie) return;
    jouerSon("REFUS_BLAGUE", preferencesSonores);
    const nouvellePartie = refuserBlague(partie);
    setPartie(nouvellePartie);
    setEcranActif("tour");
    
    // Automatiquement tirer une nouvelle blague en utilisant la nouvelle partie
    setTimeout(() => {
      const resultat = tirerBlague(nouvellePartie);
      
      if (resultat.erreur === "aucuneDisponible") {
        alert("Plus de blagues disponibles ! Veuillez élargir les catégories ou recommencer.");
        return;
      }
      
      if (resultat.erreur === "pasDeCategories") {
        alert("Aucune catégorie sélectionnée pour ce joueur !");
        return;
      }

      if (resultat.blague) {
        const partieAvecBlague = revelerBlague(nouvellePartie, resultat.blague);
        setPartie(partieAvecBlague);
        setEcranActif("revelation");
      }
    }, 100);
  };

  const handleJeRisJeSors = () => {
    // Ouvrir l'écran de sélection des joueurs qui ont ri
    setJoueursAEliminer([]);
    setEcranActif("jeRisJeSors");
  };

  const handleConfirmerJeRisJeSors = () => {
    if (!partie || joueursAEliminer.length === 0) return;
    
    jouerSon("JOUEUR_ELIMINÉ", preferencesSonores);
    const joueursActifs = partie.joueurs.filter(j => !j.estElimine);
    
    // Si tous les joueurs actifs ont ri, partie terminée sans gagnant
    if (joueursAEliminer.length === joueursActifs.length) {
      const nouvellePartie: EtatPartie = {
        ...partie,
        joueurs: partie.joueurs.map(j => ({ ...j, estElimine: true })),
        estTerminee: true,
        gagnantId: undefined, // Pas de gagnant si tout le monde a ri
        dateFin: new Date(),
      };
      setPartie(nouvellePartie);
      setJoueursAEliminer([]);
      return;
    }
    
    // Sinon, éliminer les joueurs sélectionnés
    const nouvellePartie = eliminerJoueurs(partie, joueursAEliminer);
    setPartie(nouvellePartie);
    setJoueursAEliminer([]);
    
    if (!nouvellePartie.estTerminee) {
      // Passer au joueur suivant après l'élimination
      const partieAvecJoueurSuivant = passerAuJoueurSuivant(nouvellePartie);
      setPartie(partieAvecJoueurSuivant);
      setEcranActif("tour");
    } else {
      jouerSon("VICTOIRE", preferencesSonores);
    }
  };

  const handleEliminerJoueurs = () => {
    if (!partie || joueursAEliminer.length === 0) return;
    
    const nouvellePartie = eliminerJoueurs(partie, joueursAEliminer);
    setPartie(nouvellePartie);
    setJoueursAEliminer([]);
    
    if (!nouvellePartie.estTerminee) {
      // Passer au joueur suivant après l'élimination
      const partieAvecJoueurSuivant = passerAuJoueurSuivant(nouvellePartie);
      setPartie(partieAvecJoueurSuivant);
      setEcranActif("tour");
    }
  };

  const handleRecommencer = () => {
    if (!partie) return;
    const nouvellePartie = recommencerPartie(partie);
    setPartie(nouvellePartie);
    setEcranActif("tour");
  };

  const handleAbandonner = () => {
    supprimerPartieEnCours();
    router.push("/");
  };

  if (!partie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
        <div className="text-white text-2xl">Chargement...</div>
      </div>
    );
  }

  const joueurCourant = obtenirJoueurCourant(partie);
  const joueursActifs = partie.joueurs.filter(j => !j.estElimine);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
      {/* Stats simplifiées en haut à gauche */}
      {ecranActif !== "victoire" && ecranActif !== "menu" && (
        <div className="fixed top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 text-sm z-50">
          <div className="font-bold text-purple-900">{joueurCourant?.nom || "En attente"}</div>
          <div className="text-gray-600 text-xs mt-1">
            {joueursActifs.length} joueur{joueursActifs.length > 1 ? 's' : ''} • {partie.joueurs.filter(j => j.estElimine).length} éliminé{partie.joueurs.filter(j => j.estElimine).length > 1 ? 's' : ''}
          </div>
          {joueurCourant && (
            <div className="text-gray-600 text-xs">
              Refus: {joueurCourant.refusRestants}/2
            </div>
          )}
        </div>
      )}
      <AnimatePresence mode="wait">
        {/* Écran Tour */}
        {ecranActif === "tour" && joueurCourant && (
          <motion.div
            key="tour"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="min-h-screen flex flex-col items-center justify-center p-4"
          >
            <Button
              variant="ghost"
              onClick={() => setEcranActif("menu")}
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              size="icon"
            >
              <Menu className="w-6 h-6" />
            </Button>

            <div className="max-w-2xl w-full text-center space-y-8">
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-white"
              >
                <div className="text-sm opacity-80 mb-2">Au tour de</div>
                <h1 className="text-6xl font-black mb-4">{joueurCourant.nom}</h1>
                <div className="text-lg opacity-90">
                  Joueurs restants : {joueursActifs.length}
                </div>
              </motion.div>

              <Card className="bg-white/95">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <div>Refus restants : {joueurCourant.refusRestants} / 2</div>
                      <div>Blagues vues : {joueurCourant.nbBlagues}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleJeSuisPret}
                size="xl"
                className="w-full bg-green-500 hover:bg-green-600 text-2xl py-8"
              >
                <Eye className="w-8 h-8 mr-3" />
                Je suis prêt !
              </Button>

              <Button
                onClick={handleJeRisJeSors}
                variant="destructive"
                size="lg"
                className="w-full"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Qui a ri ?
              </Button>
            </div>
          </motion.div>
        )}

        {/* Écran Révélation */}
        {ecranActif === "revelation" && partie.blagueActuelle && (
          <motion.div
            key="revelation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-3 pt-16 pb-6"
          >
            <Button
              variant="ghost"
              onClick={() => setEcranActif("menu")}
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              size="icon"
            >
              <Menu className="w-6 h-6" />
            </Button>

            <div className="max-w-2xl w-full space-y-4">
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="w-full bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="p-3 text-center border-b border-gray-200">
                  <h2 className="text-lg font-bold text-purple-900">
                    {partie.blagueActuelle.titre}
                  </h2>
                </div>
                
                {partie.blagueActuelle.imageUrl && (
                  <div className="w-full flex justify-center bg-gray-100 py-3">
                    <img
                      src={partie.blagueActuelle.imageUrl}
                      alt={partie.blagueActuelle.titre}
                      className="object-contain"
                      style={{ width: '50vw', maxHeight: '44vh' }}
                    />
                  </div>
                )}
                
                <div className="p-3 text-center">
                  <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                    {partie.blagueActuelle.texte}
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    {partie.blagueActuelle.categorie}
                  </div>
                  
                  {joueurCourant && joueurCourant.refusRestants > 0 && (
                    <Button
                      onClick={handleRefuserBlague}
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Refuser cette blague ({joueurCourant.refusRestants})
                    </Button>
                  )}
                </div>
              </motion.div>

              <div className="flex gap-3">
                <Button
                  onClick={handleJoueurSuivant}
                  className="flex-1 py-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg"
                  size="lg"
                >
                  <SkipForward className="w-5 h-5 mr-2" />
                  Joueur suivant
                </Button>
                
                <Button
                  onClick={handleJeRisJeSors}
                  className="flex-1 py-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold shadow-lg"
                  size="lg"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Qui a ri ?
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Menu Pause */}
        {ecranActif === "menu" && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-2xl">Menu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setEcranActif(partie.blagueActuelle ? "revelation" : "tour")}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Reprendre
                </Button>
                
                <Button
                  onClick={() => setEcranActif("eliminer")}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <UserMinus className="w-5 h-5 mr-2" />
                  Éliminer un joueur
                </Button>
                
                <Button
                  onClick={handleRecommencer}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Recommencer
                </Button>
                
                <Button
                  onClick={handleAbandonner}
                  variant="destructive"
                  className="w-full"
                  size="lg"
                >
                  Quitter
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Écran Éliminer depuis le menu */}
        {ecranActif === "eliminer" && (
          <motion.div
            key="eliminer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-2xl">Éliminer des joueurs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {joueursActifs.map(joueur => (
                  <button
                    key={joueur.id}
                    onClick={() => {
                      setJoueursAEliminer(prev =>
                        prev.includes(joueur.id)
                          ? prev.filter(id => id !== joueur.id)
                          : [...prev, joueur.id]
                      );
                    }}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      joueursAEliminer.includes(joueur.id)
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-bold">{joueur.nom}</div>
                    <div className="text-sm text-gray-600">
                      {joueur.nbBlagues} blagues vues
                    </div>
                  </button>
                ))}
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleEliminerJoueurs}
                    disabled={joueursAEliminer.length === 0}
                    variant="destructive"
                    className="flex-1"
                  >
                    Éliminer ({joueursAEliminer.length})
                  </Button>
                  <Button
                    onClick={() => {
                      setJoueursAEliminer([]);
                      setEcranActif("menu");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Écran Je ris : je sors ! */}
        {ecranActif === "jeRisJeSors" && (
          <motion.div
            key="jeRisJeSors"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="min-h-screen flex items-center justify-center p-4 pt-20"
          >
            <Button
              variant="ghost"
              onClick={() => setEcranActif("menu")}
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              size="icon"
            >
              <Menu className="w-6 h-6" />
            </Button>

            <Card className="w-full max-w-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-center">
                  😂 Qui a ri ?
                </CardTitle>
                <p className="text-center text-gray-600 text-sm">
                  Sélectionnez le ou les joueurs
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {joueursActifs.map(joueur => (
                  <button
                    key={joueur.id}
                    onClick={() => {
                      setJoueursAEliminer(prev =>
                        prev.includes(joueur.id)
                          ? prev.filter(id => id !== joueur.id)
                          : [...prev, joueur.id]
                      );
                    }}
                    className={`w-full p-2 rounded-lg border-2 text-left transition-all ${
                      joueursAEliminer.includes(joueur.id)
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <p className="font-bold text-sm">{joueur.nom}</p>
                        <p className="text-xs text-gray-600">
                          {joueur.nbBlagues} blagues
                        </p>
                      </div>
                      {joueursAEliminer.includes(joueur.id) && (
                        <div className="text-xl">😂</div>
                      )}
                    </div>
                  </button>
                ))}

                {joueursAEliminer.length === joueursActifs.length && (
                  <div className="p-2 bg-yellow-50 border border-yellow-300 rounded text-xs text-center">
                    <p className="font-bold text-yellow-800">
                      ⚠️ Tous ont ri - Partie terminée
                    </p>
                  </div>
                )}

                {joueursAEliminer.length === joueursActifs.length - 1 && (
                  <div className="p-2 bg-green-50 border border-green-300 rounded text-xs text-center">
                    <p className="font-bold text-green-800">
                      🎉 {joueursActifs.find(j => !joueursAEliminer.includes(j.id))?.nom} gagne
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => {
                    setJoueursAEliminer([]);
                    handleJoueurSuivant();
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full bg-white"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Personne n&apos;a ri - Joueur suivant
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleConfirmerJeRisJeSors}
                    disabled={joueursAEliminer.length === 0}
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                  >
                    Confirmer ({joueursAEliminer.length})
                  </Button>
                  <Button
                    onClick={() => {
                      setJoueursAEliminer([]);
                      setEcranActif(partie.blagueActuelle ? "revelation" : "tour");
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Écran Victoire */}
        {ecranActif === "victoire" && partie.estTerminee && (
          <EcranVictoire
            partie={partie}
            onRecommencer={handleRecommencer}
            onQuitter={handleAbandonner}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EcranVictoire({
  partie,
  onRecommencer,
  onQuitter,
}: {
  partie: EtatPartie;
  onRecommencer: () => void;
  onQuitter: () => void;
}) {
  const stats = obtenirStatistiques(partie);
  
  // Cas où tout le monde a ri (pas de gagnant)
  const toutLeMondeARi = !partie.gagnantId && partie.estTerminee;

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
              <h1 className="text-7xl font-black mb-4">😂</h1>
              <h2 className="text-5xl font-black mb-2">Partie terminée !</h2>
              <p className="text-2xl opacity-90 mt-2">
                Tout le monde a ri, personne ne gagne !
              </p>
            </>
          ) : stats && stats.gagnant ? (
            <>
              <h1 className="text-7xl font-black mb-4">🎉</h1>
              <h2 className="text-5xl font-black mb-2">Victoire !</h2>
              <p className="text-3xl font-bold">{stats.gagnant.nom}</p>
              <p className="text-xl opacity-90 mt-2">a gagné la partie !</p>
            </>
          ) : null}
        </motion.div>

        {stats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {stats.nbBlaguesTotales}
                  </div>
                  <div className="text-sm text-gray-600">Blagues vues</div>
                </div>
                <div className="p-4 bg-pink-50 rounded-lg">
                  <div className="text-3xl font-bold text-pink-600">
                    {Math.floor(stats.dureePartie / 60)}:{(stats.dureePartie % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-600">Durée</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold mb-2">Joueurs :</div>
                {stats.joueurs
                  .sort((a, b) => b.nbBlagues - a.nbBlagues)
                  .map((j, index) => (
                    <div
                      key={j.joueur.id}
                      className={`p-3 rounded-lg ${
                        stats.gagnant && j.joueur.id === stats.gagnant.id
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
                          {stats.gagnant && j.joueur.id === stats.gagnant.id && " 👑"}
                          {j.joueur.estElimine && " 😂"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {j.nbBlagues} blagues • {j.nbRefus} refus
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          <Button
            onClick={onRecommencer}
            size="xl"
            className="w-full bg-green-500 hover:bg-green-600"
          >
            <RotateCcw className="w-6 h-6 mr-2" />
            Rejouer
          </Button>
          <Button
            onClick={onQuitter}
            size="xl"
            variant="outline"
            className="w-full bg-white"
          >
            <Home className="w-6 h-6 mr-2" />
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
