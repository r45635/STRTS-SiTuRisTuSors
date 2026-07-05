"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { envoyerMagicLink } from "@/lib/auth";
import { supabaseDisponible } from "@/lib/supabase";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const handleEnvoyer = async () => {
    if (!email.trim()) return;
    setEnvoi(true);
    setErreur(null);
    const { erreur: err } = await envoyerMagicLink(email);
    setEnvoi(false);
    if (err) {
      setErreur(err);
    } else {
      setEnvoye(true);
    }
  };

  if (!supabaseDisponible()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Supabase n&apos;est pas configuré.</p>
            <p className="text-sm text-gray-500 mt-2">Ajoutez les variables d&apos;environnement dans <code>.env.local</code>.</p>
            <Button onClick={() => router.push("/")} variant="outline" className="mt-4">
              Retour à l&apos;accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-4">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-white hover:bg-white/20 mb-6"
            aria-label="Retour à l'accueil"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {envoye ? "Vérifiez votre email" : "Connexion"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {envoye ? (
                <div className="text-center space-y-4">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" aria-hidden="true" />
                  <p className="text-gray-600">
                    Un lien de connexion a été envoyé à <strong>{email}</strong>.
                  </p>
                  <p className="text-sm text-gray-500">
                    Cliquez sur le lien dans l&apos;email pour vous connecter. Le lien expire dans 1 heure.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => { setEnvoye(false); setEmail(""); }}
                    className="w-full"
                  >
                    Utiliser une autre adresse
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block" htmlFor="email-connexion">
                      Adresse email
                    </label>
                    <Input
                      id="email-connexion"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleEnvoyer()}
                      placeholder="votre@email.com"
                      disabled={envoi}
                      aria-label="Adresse email pour connexion"
                    />
                  </div>

                  {erreur && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
                      {erreur}
                    </div>
                  )}

                  <Button
                    onClick={handleEnvoyer}
                    disabled={!email.trim() || envoi}
                    className="w-full"
                    aria-label="Envoyer le lien de connexion"
                  >
                    {envoi ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />Envoi en cours...</>
                    ) : (
                      <><Mail className="w-4 h-4 mr-2" aria-hidden="true" />Envoyer le lien magique</>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Pas de mot de passe — nous vous envoyons un lien de connexion par email.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
