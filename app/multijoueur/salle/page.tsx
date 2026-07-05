"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Copy, Check, Users, Play, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  obtenirJoueursPartie,
  ecouterPartie,
  mettreAJourEtatPartie,
  arreterEcoute,
  type JoueurMultijoueur,
  type EtatPartieMultijoueur,
} from "@/lib/multijoueur";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { toast } from "sonner";

function SallePageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code") ?? "";
  const [joueurs, setJoueurs] = useState<JoueurMultijoueur[]>([]);
  const [estHote, setEstHote] = useState(false);
  const [partieId, setPartieId] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);
  const [depart, setDepart] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const pid = sessionStorage.getItem("strts_multi_partie_id");
    const hote = sessionStorage.getItem("strts_multi_hote") === "true";
    if (!pid) { router.push("/multijoueur"); return; }
    setPartieId(pid);
    setEstHote(hote);

    obtenirJoueursPartie(pid).then(setJoueurs);

    channelRef.current = ecouterPartie(pid, (etat: EtatPartieMultijoueur) => {
      if (etat.statut === "en_cours") {
        router.push(`/multijoueur/jeu?partieId=${pid}`);
      }
    });

    // Rafraîchir joueurs toutes les 3s
    const interval = setInterval(() => {
      obtenirJoueursPartie(pid).then(setJoueurs);
    }, 3000);

    return () => {
      clearInterval(interval);
      arreterEcoute(channelRef.current);
    };
  }, [router]);

  const copierCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopie(true);
    toast.success("Code copié !");
    setTimeout(() => setCopie(false), 2000);
  };

  const demarrerPartie = async () => {
    if (!partieId || joueurs.length < 2) return;
    setDepart(true);
    const etat: EtatPartieMultijoueur = {
      statut: "en_cours",
      joueurs: joueurs.map(j => ({ ...j, estElimine: false, refusRestants: 2 })),
      tourJoueurId: joueurs[0].id,
      blagueActuelleId: null,
      gagnantId: null,
    };
    await mettreAJourEtatPartie(partieId, etat);
    router.push(`/multijoueur/jeu?partieId=${partieId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-4">
      <div className="max-w-md mx-auto py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/multijoueur")}
            className="text-white hover:bg-white/20 mb-4"
            aria-label="Quitter la salle"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Quitter
          </Button>
          <h1 className="text-4xl font-black text-white mb-2">Salle d&apos;attente</h1>
          <p className="text-white/80">Partagez le code pour inviter des joueurs</p>
        </motion.div>

        <div className="space-y-4">
          {/* Code de la partie */}
          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <div className="text-sm text-gray-500">Code de la partie</div>
              <div className="text-6xl font-black font-mono tracking-widest text-purple-700" aria-label={`Code de la partie : ${code}`}>
                {code}
              </div>
              <Button
                onClick={copierCode}
                variant="outline"
                className="w-full"
                aria-label="Copier le code de la partie"
              >
                {copie ? (
                  <><Check className="w-4 h-4 mr-2 text-green-500" aria-hidden="true" />Copié !</>
                ) : (
                  <><Copy className="w-4 h-4 mr-2" aria-hidden="true" />Copier le code</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Joueurs connectés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" aria-hidden="true" />
                Joueurs ({joueurs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {joueurs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">En attente de joueurs...</p>
              ) : (
                <div className="space-y-2" role="list" aria-label="Joueurs connectés">
                  {joueurs.map(j => (
                    <div key={j.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg" role="listitem">
                      <div className="w-3 h-3 rounded-full bg-green-400" aria-label="connecté" />
                      <span className="font-medium">{j.nom}</span>
                      {j.estHote && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Hôte</span>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {estHote && (
            <Button
              onClick={demarrerPartie}
              disabled={joueurs.length < 2 || depart}
              size="xl"
              className="w-full bg-green-500 hover:bg-green-600"
              aria-label="Démarrer la partie multijoueur"
            >
              <Play className="w-5 h-5 mr-2" aria-hidden="true" />
              {depart ? "Démarrage..." : `Démarrer (${joueurs.length} joueurs)`}
            </Button>
          )}

          {!estHote && (
            <div className="text-center text-white/80 py-4" role="status" aria-live="polite">
              En attente que l&apos;hôte démarre la partie...
            </div>
          )}

          {joueurs.length < 2 && estHote && (
            <div className="text-center text-white/70 text-sm" role="alert">
              Minimum 2 joueurs pour démarrer
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SallePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <SallePageInner />
    </Suspense>
  );
}
