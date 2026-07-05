"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { creerPartieMultijoueur, rejoindrePartie } from "@/lib/multijoueur";
import { supabaseDisponible } from "@/lib/supabase";
import { toast } from "sonner";

export default function MultijoueurPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"menu" | "creer" | "rejoindre">("menu");
  const [nom, setNom] = useState("");
  const [code, setCode] = useState("");
  const [chargement, setChargement] = useState(false);

  const handleCreer = async () => {
    if (!nom.trim()) return;
    setChargement(true);
    const { partie, erreur } = await creerPartieMultijoueur(nom.trim());
    setChargement(false);
    if (erreur) {
      toast.error(erreur);
      return;
    }
    if (partie) {
      sessionStorage.setItem("strts_multi_partie_id", partie.id);
      sessionStorage.setItem("strts_multi_nom", nom.trim());
      sessionStorage.setItem("strts_multi_hote", "true");
      router.push(`/multijoueur/salle?code=${partie.code}`);
    }
  };

  const handleRejoindre = async () => {
    if (!nom.trim() || !code.trim()) return;
    setChargement(true);
    const { partie, erreur } = await rejoindrePartie(code.trim(), nom.trim());
    setChargement(false);
    if (erreur) {
      toast.error(erreur);
      return;
    }
    if (partie) {
      sessionStorage.setItem("strts_multi_partie_id", partie.id);
      sessionStorage.setItem("strts_multi_nom", nom.trim());
      sessionStorage.setItem("strts_multi_hote", "false");
      router.push(`/multijoueur/salle?code=${partie.code}`);
    }
  };

  if (!supabaseDisponible()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4 text-center">
            <div className="text-4xl" aria-hidden="true">🔧</div>
            <p className="font-semibold">Supabase requis</p>
            <p className="text-sm text-gray-600">
              Le mode multijoueur nécessite Supabase. Créez un projet sur{" "}
              <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">
                supabase.com
              </a>{" "}
              et configurez les variables dans <code className="bg-gray-100 px-1 rounded">.env.local</code>.
            </p>
            <p className="text-xs text-gray-400">Voir <code>.env.example</code> et <code>supabase/schema.sql</code> pour les instructions.</p>
            <Button onClick={() => router.push("/")} variant="outline">Retour à l&apos;accueil</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-4">
      <div className="max-w-md mx-auto py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button
            variant="ghost"
            onClick={() => mode === "menu" ? router.push("/") : setMode("menu")}
            className="text-white hover:bg-white/20 mb-4"
            aria-label="Retour"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-4xl font-black text-white mb-2">Multijoueur</h1>
          <p className="text-white/80">Chaque joueur sur son téléphone</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {mode === "menu" && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <Button
                    onClick={() => setMode("creer")}
                    size="lg"
                    className="w-full bg-green-500 hover:bg-green-600"
                    aria-label="Créer une nouvelle partie multijoueur"
                  >
                    <Plus className="w-5 h-5 mr-2" aria-hidden="true" />
                    Créer une partie
                  </Button>
                  <Button
                    onClick={() => setMode("rejoindre")}
                    size="lg"
                    variant="outline"
                    className="w-full"
                    aria-label="Rejoindre une partie existante"
                  >
                    <Users className="w-5 h-5 mr-2" aria-hidden="true" />
                    Rejoindre une partie
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {mode === "creer" && (
            <Card>
              <CardHeader>
                <CardTitle>Créer une partie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block" htmlFor="nom-hote">Votre nom</label>
                  <Input
                    id="nom-hote"
                    value={nom}
                    onChange={e => setNom(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleCreer()}
                    placeholder="Entrez votre nom..."
                    aria-label="Votre nom"
                    disabled={chargement}
                  />
                </div>
                <Button
                  onClick={handleCreer}
                  disabled={!nom.trim() || chargement}
                  className="w-full"
                  aria-label="Créer et obtenir le code de la partie"
                >
                  {chargement ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />Création...</>
                  ) : (
                    "Créer la partie"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {mode === "rejoindre" && (
            <Card>
              <CardHeader>
                <CardTitle>Rejoindre une partie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block" htmlFor="nom-joueur">Votre nom</label>
                  <Input
                    id="nom-joueur"
                    value={nom}
                    onChange={e => setNom(e.target.value)}
                    placeholder="Entrez votre nom..."
                    disabled={chargement}
                    aria-label="Votre nom"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block" htmlFor="code-partie">Code de la partie</label>
                  <Input
                    id="code-partie"
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === "Enter" && handleRejoindre()}
                    placeholder="XXXXXX"
                    maxLength={6}
                    className="text-2xl font-mono text-center tracking-widest"
                    disabled={chargement}
                    aria-label="Code de la partie (6 caractères)"
                  />
                </div>
                <Button
                  onClick={handleRejoindre}
                  disabled={!nom.trim() || code.trim().length < 6 || chargement}
                  className="w-full"
                  aria-label="Rejoindre la partie"
                >
                  {chargement ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />Connexion...</>
                  ) : (
                    "Rejoindre"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
