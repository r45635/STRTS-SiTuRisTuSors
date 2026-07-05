"use client";

import { motion } from "framer-motion";
import { UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EcranMenuProps {
  hasBlagueActuelle: boolean;
  onReprendre: () => void;
  onEliminer: () => void;
  onRecommencer: () => void;
  onAbandonner: () => void;
}

export function EcranMenu({
  hasBlagueActuelle,
  onReprendre,
  onEliminer,
  onRecommencer,
  onAbandonner,
}: EcranMenuProps) {
  return (
    <motion.div
      key="menu"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-md" role="dialog" aria-label="Menu pause">
        <CardHeader>
          <CardTitle className="text-2xl">Menu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={onReprendre}
            variant="outline"
            className="w-full"
            size="lg"
            aria-label="Reprendre la partie"
          >
            Reprendre
          </Button>

          <Button
            onClick={onEliminer}
            variant="outline"
            className="w-full"
            size="lg"
            aria-label="Éliminer un joueur manuellement"
          >
            <UserMinus className="w-5 h-5 mr-2" aria-hidden="true" />
            Éliminer un joueur
          </Button>

          <Button
            onClick={onRecommencer}
            variant="outline"
            className="w-full"
            size="lg"
            aria-label="Recommencer une nouvelle partie"
          >
            Recommencer
          </Button>

          <Button
            onClick={onAbandonner}
            variant="destructive"
            className="w-full"
            size="lg"
            aria-label="Quitter et retourner à l'accueil"
          >
            Quitter
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
