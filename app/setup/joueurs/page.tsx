"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Play, User, Save, X, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ConfigurationPartie, Joueur, ProfilJoueur } from "@/types";
import { creerJoueur, creerPartie } from "@/lib/game";
import { chargerBlagues, obtenirCategories, compterBlaguesParCategorie } from "@/lib/blagues";
import {
  sauvegarderPartieEnCours,
  chargerProfilsJoueurs,
  sauvegarderProfilJoueur,
  supprimerProfilJoueur,
  modifierProfilJoueur,
  mettreAJourDerniereUtilisation,
} from "@/lib/storage";
import { toast } from "sonner";

export default function JoueursPage() {
  const router = useRouter();
  const [config, setConfig] = useState<ConfigurationPartie | null>(null);
  const [joueurs, setJoueurs] = useState<Joueur[]>([]);
  const [nomNouveauJoueur, setNomNouveauJoueur] = useState("");
  const [profilsDisponibles, setProfilsDisponibles] = useState<ProfilJoueur[]>([]);
  const [afficherProfils, setAfficherProfils] = useState(false);
  const [profilEnEdition, setProfilEnEdition] = useState<string | null>(null);
  const [profilASupprimer, setProfilASupprimer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const categoriesDisponibles = obtenirCategories();
  const compteurBlagues = compterBlaguesParCategorie();

  useEffect(() => {
    const configStr = sessionStorage.getItem("strts_config");
    if (!configStr) {
      router.push("/setup");
      return;
    }
    setConfig(JSON.parse(configStr));
    const profils = chargerProfilsJoueurs();
    setProfilsDisponibles(profils.sort((a, b) => b.lastUsedAt.getTime() - a.lastUsedAt.getTime()));
    setIsLoading(false);
  }, [router]);

  const ajouterJoueur = () => {
    if (!nomNouveauJoueur.trim()) return;
    const nouveauJoueur = creerJoueur(nomNouveauJoueur.trim(), categoriesDisponibles);
    setJoueurs([...joueurs, nouveauJoueur]);
    setNomNouveauJoueur("");
  };

  const ajouterDepuisProfil = (profil: ProfilJoueur) => {
    if (joueurs.some(j => j.nom.toLowerCase() === profil.nom.toLowerCase())) {
      toast.error(`"${profil.nom}" est déjà dans la liste`);
      return;
    }
    const nouveauJoueur = creerJoueur(profil.nom, profil.categoriesPreferees);
    setJoueurs([...joueurs, nouveauJoueur]);
    mettreAJourDerniereUtilisation(profil.id);
    setAfficherProfils(false);
    const profils = chargerProfilsJoueurs();
    setProfilsDisponibles(profils.sort((a, b) => b.lastUsedAt.getTime() - a.lastUsedAt.getTime()));
  };

  const sauvegarderCommeProfil = (joueur: Joueur) => {
    const profil: ProfilJoueur = {
      id: joueur.id,
      nom: joueur.nom,
      categoriesPreferees: joueur.categoriesPreferees,
      nbPartiesJouees: 0,
      lastUsedAt: new Date(),
    };
    sauvegarderProfilJoueur(profil);
    const profils = chargerProfilsJoueurs();
    setProfilsDisponibles(profils.sort((a, b) => b.lastUsedAt.getTime() - a.lastUsedAt.getTime()));
    toast.success(`Profil "${joueur.nom}" sauvegardé`);
  };

  const supprimerProfil = (id: string) => {
    supprimerProfilJoueur(id);
    const profils = chargerProfilsJoueurs();
    setProfilsDisponibles(profils.sort((a, b) => b.lastUsedAt.getTime() - a.lastUsedAt.getTime()));
    setProfilASupprimer(null);
  };

  const modifierProfil = (id: string, modifications: Partial<Omit<ProfilJoueur, "id">>) => {
    modifierProfilJoueur(id, modifications);
    const profils = chargerProfilsJoueurs();
    setProfilsDisponibles(profils.sort((a, b) => b.lastUsedAt.getTime() - a.lastUsedAt.getTime()));
    setProfilEnEdition(null);
  };

  const supprimerJoueur = (id: string) => {
    setJoueurs(joueurs.filter(j => j.id !== id));
  };

  const toggleCategorieJoueur = (joueurId: string, categorie: string) => {
    setJoueurs(joueurs.map(j => {
      if (j.id !== joueurId) return j;
      const categories = j.categoriesPreferees.includes(categorie)
        ? j.categoriesPreferees.filter(c => c !== categorie)
        : [...j.categoriesPreferees, categorie];
      return { ...j, categoriesPreferees: categories };
    }));
  };

  const demarrerPartie = () => {
    if (!config) return;
    const toutesLesBlagues = chargerBlagues();
    const partie = creerPartie(config, joueurs, toutesLesBlagues);
    sauvegarderPartieEnCours(partie);
    sessionStorage.removeItem("strts_config");
    router.push("/game");
  };

  const peutDemarrer =
    joueurs.length >= 2 &&
    (config?.modeCategorie === "communes" || joueurs.every(j => j.categoriesPreferees.length > 0));

  if (isLoading || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <div className="text-white text-xl font-semibold">Chargement...</div>
        </div>
      </div>
    );
  }

  const profilEnEditionData = profilsDisponibles.find(p => p.id === profilEnEdition);
  const profilASupprimerData = profilsDisponibles.find(p => p.id === profilASupprimer);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.push("/setup")}
            className="text-white hover:bg-white/20 mb-4"
            aria-label="Retour à la configuration"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-4xl font-black text-white mb-2">Ajouter les joueurs</h1>
          <p className="text-white/80">Étape 2/2 - Minimum 2 joueurs</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Ajout de joueur */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Nouveau joueur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={nomNouveauJoueur}
                  onChange={(e) => setNomNouveauJoueur(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && ajouterJoueur()}
                  placeholder="Nom du joueur..."
                  className="text-lg flex-1"
                  aria-label="Nom du nouveau joueur"
                />
                <Button
                  onClick={ajouterJoueur}
                  disabled={!nomNouveauJoueur.trim()}
                  size="lg"
                  aria-label="Ajouter le joueur"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter
                </Button>
              </div>

              <div className="border-t pt-3 mt-3">
                <Button
                  onClick={() => setAfficherProfils(!afficherProfils)}
                  variant="outline"
                  className="w-full"
                  aria-expanded={afficherProfils}
                >
                  <User className="w-4 h-4 mr-2" />
                  {afficherProfils ? "Masquer" : "Profils sauvegardés"} ({profilsDisponibles.length})
                </Button>

                {afficherProfils && (
                  <div className="mt-3 space-y-2 max-h-60 overflow-y-auto" role="list" aria-label="Profils sauvegardés">
                    {profilsDisponibles.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Aucun profil sauvegardé. Ajoutez des joueurs et cliquez sur l&apos;icône 💾 pour sauvegarder un profil.
                      </p>
                    ) : (
                      profilsDisponibles.map((profil) => (
                        <div key={profil.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded border" role="listitem">
                          <Button
                            onClick={() => ajouterDepuisProfil(profil)}
                            variant="ghost"
                            className="flex-1 justify-start"
                            aria-label={`Ajouter ${profil.nom}`}
                          >
                            <User className="w-4 h-4 mr-2" />
                            <div className="text-left">
                              <div className="font-semibold">{profil.nom}</div>
                              <div className="text-xs text-gray-500">
                                {profil.categoriesPreferees.length} catégorie(s)
                              </div>
                            </div>
                          </Button>
                          <Button
                            onClick={() => setProfilEnEdition(profil.id)}
                            variant="ghost"
                            size="icon"
                            aria-label={`Modifier le profil ${profil.nom}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => setProfilASupprimer(profil.id)}
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:bg-red-50"
                            aria-label={`Supprimer le profil ${profil.nom}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Liste des joueurs */}
          {joueurs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Joueurs ({joueurs.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {joueurs.map((joueur, index) => (
                  <div key={joueur.id} className="p-4 bg-white rounded-lg border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold" aria-hidden="true">
                          {index + 1}
                        </div>
                        <span className="font-bold text-lg">{joueur.nom}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => sauvegarderCommeProfil(joueur)}
                          className="text-green-600 hover:bg-green-50"
                          aria-label={`Sauvegarder le profil de ${joueur.nom}`}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => supprimerJoueur(joueur.id)}
                          className="text-red-500 hover:bg-red-50"
                          aria-label={`Supprimer ${joueur.nom} de la liste`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {config.modeCategorie === "parJoueur" && (
                      <div className="mt-3">
                        <div className="text-sm font-medium mb-2">
                          Catégories ({joueur.categoriesPreferees.length})
                        </div>
                        <div className="flex flex-wrap gap-2" role="group" aria-label={`Catégories de ${joueur.nom}`}>
                          {categoriesDisponibles.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => toggleCategorieJoueur(joueur.id, cat)}
                              aria-pressed={joueur.categoriesPreferees.includes(cat)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                joueur.categoriesPreferees.includes(cat)
                                  ? "bg-purple-500 text-white"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              {cat} ({compteurBlagues[cat] || 0})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {joueurs.length < 2 && (
            <div className="bg-yellow-400 text-yellow-900 p-4 rounded-lg font-medium" role="alert">
              ⚠️ Il faut au moins 2 joueurs pour démarrer
            </div>
          )}

          {config.modeCategorie === "parJoueur" && joueurs.some(j => j.categoriesPreferees.length === 0) && (
            <div className="bg-yellow-400 text-yellow-900 p-4 rounded-lg font-medium" role="alert">
              ⚠️ Tous les joueurs doivent sélectionner au moins une catégorie
            </div>
          )}

          <Button
            onClick={demarrerPartie}
            disabled={!peutDemarrer}
            size="xl"
            className="w-full bg-green-500 hover:bg-green-600"
            aria-label="Démarrer la partie"
          >
            <Play className="w-5 h-5 mr-2" />
            Démarrer la partie !
          </Button>
        </motion.div>
      </div>

      {/* Dialog suppression profil */}
      <AlertDialog open={!!profilASupprimer} onOpenChange={(open) => !open && setProfilASupprimer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le profil</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment supprimer le profil &quot;{profilASupprimerData?.nom}&quot; ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => profilASupprimer && supprimerProfil(profilASupprimer)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog édition profil */}
      <Dialog open={!!profilEnEdition} onOpenChange={(open) => !open && setProfilEnEdition(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
          </DialogHeader>
          {profilEnEditionData && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="profil-nom">Nom</label>
                <Input
                  id="profil-nom"
                  value={profilEnEditionData.nom}
                  onChange={(e) => {
                    const nouveauNom = e.target.value;
                    setProfilsDisponibles(prev =>
                      prev.map(p => (p.id === profilEnEdition ? { ...p, nom: nouveauNom } : p))
                    );
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Catégories ({profilEnEditionData.categoriesPreferees.length})
                </label>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Sélection des catégories">
                  {categoriesDisponibles.map((cat) => (
                    <button
                      key={cat}
                      aria-pressed={profilEnEditionData.categoriesPreferees.includes(cat)}
                      onClick={() => {
                        setProfilsDisponibles(prev =>
                          prev.map(p => {
                            if (p.id !== profilEnEdition) return p;
                            const categories = p.categoriesPreferees.includes(cat)
                              ? p.categoriesPreferees.filter(c => c !== cat)
                              : [...p.categoriesPreferees, cat];
                            return { ...p, categoriesPreferees: categories };
                          })
                        );
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        profilEnEditionData.categoriesPreferees.includes(cat)
                          ? "bg-purple-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {cat} ({compteurBlagues[cat] || 0})
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    modifierProfil(profilEnEdition!, {
                      nom: profilEnEditionData.nom,
                      categoriesPreferees: profilEnEditionData.categoriesPreferees,
                    });
                  }}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
                <Button onClick={() => setProfilEnEdition(null)} variant="outline" className="flex-1">
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
