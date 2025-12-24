"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, User, Edit, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  chargerProfilsJoueurs,
  supprimerProfilJoueur,
  modifierProfilJoueur,
  type ProfilJoueur,
} from "@/lib/storage";
import { obtenirCategories, compterBlaguesParCategorie } from "@/lib/blagues";

export default function PreferencesPage() {
  const router = useRouter();
  const [profils, setProfils] = useState<ProfilJoueur[]>([]);
  const [profilEnEdition, setProfilEnEdition] = useState<string | null>(null);
  const [categoriesDisponibles] = useState<string[]>(obtenirCategories());
  const [compteurBlagues] = useState(compterBlaguesParCategorie());

  useEffect(() => {
    chargerProfils();
  }, []);

  const chargerProfils = () => {
    const profilsCharges = chargerProfilsJoueurs();
    setProfils(profilsCharges.sort((a, b) => b.lastUsedAt.getTime() - a.lastUsedAt.getTime()));
  };

  const supprimerProfil = (id: string, nom: string) => {
    if (confirm(`Voulez-vous vraiment supprimer le profil "${nom}" ?`)) {
      supprimerProfilJoueur(id);
      chargerProfils();
    }
  };

  const modifierProfil = (id: string, modifications: Partial<Omit<ProfilJoueur, 'id'>>) => {
    modifierProfilJoueur(id, modifications);
    chargerProfils();
    setProfilEnEdition(null);
  };

  const profil = profils.find((p) => p.id === profilEnEdition);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <h1 className="text-4xl font-black text-white mb-2">
            Historique & Préférences
          </h1>
          <p className="text-white/80">Gérez vos profils de joueurs</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Profils de joueurs ({profils.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {profils.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucun profil enregistré. Créez des profils lors de la configuration des joueurs
                  en cliquant sur l&apos;icône 💾.
                </p>
              ) : (
                <div className="space-y-3">
                  {profils.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg">{p.nom}</h3>
                        <p className="text-sm text-gray-600">
                          {p.categoriesPreferees.length === 0
                            ? "Aucune catégorie préférée"
                            : `${p.categoriesPreferees.length} catégorie(s) : ${p.categoriesPreferees.join(", ")}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Dernière utilisation :{" "}
                          {new Date(p.lastUsedAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          onClick={() => setProfilEnEdition(p.id)}
                          variant="ghost"
                          size="icon"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => supprimerProfil(p.id, p.nom)}
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modal d'édition */}
      {profilEnEdition && profil && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setProfilEnEdition(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Modifier le profil</h3>
              <Button
                onClick={() => setProfilEnEdition(null)}
                variant="ghost"
                size="icon"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nom</label>
                <Input
                  value={profil.nom}
                  onChange={(e) => {
                    const nouveauxProfils = profils.map((p) =>
                      p.id === profilEnEdition ? { ...p, nom: e.target.value } : p
                    );
                    setProfils(nouveauxProfils);
                  }}
                  className="text-lg"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Catégories ({profil.categoriesPreferees.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {categoriesDisponibles.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        const nouveauxProfils = profils.map((p) => {
                          if (p.id === profilEnEdition) {
                            const nouvelleListe = p.categoriesPreferees.includes(cat)
                              ? p.categoriesPreferees.filter((c) => c !== cat)
                              : [...p.categoriesPreferees, cat];
                            return { ...p, categoriesPreferees: nouvelleListe };
                          }
                          return p;
                        });
                        setProfils(nouveauxProfils);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        profil.categoriesPreferees.includes(cat)
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
                  onClick={() =>
                    modifierProfil(profilEnEdition, {
                      nom: profil.nom,
                      categoriesPreferees: profil.categoriesPreferees,
                    })
                  }
                  className="flex-1"
                >
                  Enregistrer
                </Button>
                <Button
                  onClick={() => setProfilEnEdition(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
