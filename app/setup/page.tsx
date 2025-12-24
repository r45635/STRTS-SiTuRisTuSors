"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ConfigurationPartie, ModeCategorieType, OrdreToursType } from "@/types";
import { obtenirCategories, compterBlaguesParCategorie } from "@/lib/blagues";

export default function SetupPage() {
  const router = useRouter();
  const [nomPartie, setNomPartie] = useState("Ma partie STRTS");
  const [modeCategorie, setModeCategorie] = useState<ModeCategorieType>("communes");
  const [ordreTours, setOrdreTours] = useState<OrdreToursType>("inscription");
  
  const categoriesDisponibles = obtenirCategories();
  const compteurBlagues = compterBlaguesParCategorie();
  const [categoriesCommunes, setCategoriesCommunes] = useState<string[]>(categoriesDisponibles);

  const toggleCategorie = (categorie: string) => {
    setCategoriesCommunes(prev =>
      prev.includes(categorie)
        ? prev.filter(c => c !== categorie)
        : [...prev, categorie]
    );
  };

  const handleContinuer = () => {
    const config: ConfigurationPartie = {
      nomPartie,
      modeCategorie,
      ordreTours,
      categoriesCommunes: modeCategorie === "communes" ? categoriesCommunes : undefined,
    };
    
    // Sauvegarder la config dans sessionStorage pour la passer à la page suivante
    sessionStorage.setItem("strts_config", JSON.stringify(config));
    router.push("/setup/joueurs");
  };

  const peutContinuer = modeCategorie === "parJoueur" || categoriesCommunes.length > 0;

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
            onClick={() => router.push("/")}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          
          <h1 className="text-4xl font-black text-white mb-2">
            Configuration de la partie
          </h1>
          <p className="text-white/80">Étape 1/2 - Paramètres généraux</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Nom de la partie */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Nom de la partie</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={nomPartie}
                onChange={(e) => setNomPartie(e.target.value)}
                placeholder="Entrez un nom..."
                className="text-lg"
              />
            </CardContent>
          </Card>

          {/* Mode catégories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Mode de catégories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => setModeCategorie("communes")}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  modeCategorie === "communes"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                }`}
              >
                <div className="font-bold">Catégories communes</div>
                <div className="text-sm text-gray-600">
                  Même sélection pour tous les joueurs
                </div>
              </button>
              
              <button
                onClick={() => setModeCategorie("parJoueur")}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  modeCategorie === "parJoueur"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                }`}
              >
                <div className="font-bold">Catégories par joueur</div>
                <div className="text-sm text-gray-600">
                  Chaque joueur choisit ses catégories
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Sélection des catégories si mode communes */}
          {modeCategorie === "communes" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Sélectionnez les catégories ({categoriesCommunes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categoriesDisponibles.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategorie(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        categoriesCommunes.includes(cat)
                          ? "bg-purple-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {cat} ({compteurBlagues[cat] || 0})
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ordre des tours */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Ordre des tours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => setOrdreTours("inscription")}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  ordreTours === "inscription"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                }`}
              >
                <div className="font-bold">Ordre d&apos;inscription</div>
                <div className="text-sm text-gray-600">
                  Les joueurs jouent dans l&apos;ordre d&apos;ajout
                </div>
              </button>
              
              <button
                onClick={() => setOrdreTours("aleatoire")}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  ordreTours === "aleatoire"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                }`}
              >
                <div className="font-bold">Aléatoire au démarrage</div>
                <div className="text-sm text-gray-600">
                  L&apos;ordre sera mélangé au début de la partie
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Bouton continuer */}
          <Button
            onClick={handleContinuer}
            disabled={!peutContinuer}
            size="xl"
            className="w-full"
          >
            Continuer
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
