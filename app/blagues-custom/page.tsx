"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Edit, Save, X } from "lucide-react";
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
  chargerBlaguesCustom,
  ajouterBlagueCustom,
  supprimerBlagueCustom,
  modifierBlagueCustom,
  CATEGORIE_CUSTOM,
} from "@/lib/blagues-custom";
import { obtenirCategories } from "@/lib/blagues";
import type { Blague } from "@/types";
import { toast } from "sonner";

export default function BlaguesCustomPage() {
  const router = useRouter();
  const [blagues, setBlagues] = useState<Blague[]>([]);
  const [titre, setTitre] = useState("");
  const [texte, setTexte] = useState("");
  const [categorie, setCategorie] = useState(CATEGORIE_CUSTOM);
  const [enEdition, setEnEdition] = useState<string | null>(null);
  const [editTitre, setEditTitre] = useState("");
  const [editTexte, setEditTexte] = useState("");
  const [editCategorie, setEditCategorie] = useState("");
  const [aSupprimer, setASupprimer] = useState<string | null>(null);
  const categoriesExistantes = obtenirCategories();

  useEffect(() => {
    setBlagues(chargerBlaguesCustom());
  }, []);

  const rafraichir = () => setBlagues(chargerBlaguesCustom());

  const handleAjouter = () => {
    if (!titre.trim() || !texte.trim()) return;
    ajouterBlagueCustom({ titre, texte, categorie });
    setTitre("");
    setTexte("");
    setCategorie(CATEGORIE_CUSTOM);
    rafraichir();
    toast.success("Blague ajoutée !");
  };

  const handleCommencerEdition = (b: Blague) => {
    setEnEdition(b.id);
    setEditTitre(b.titre);
    setEditTexte(b.texte);
    setEditCategorie(b.categorie);
  };

  const handleSauvegarderEdition = () => {
    if (!enEdition) return;
    modifierBlagueCustom(enEdition, { titre: editTitre, texte: editTexte, categorie: editCategorie });
    setEnEdition(null);
    rafraichir();
    toast.success("Blague modifiée");
  };

  const handleSupprimer = () => {
    if (!aSupprimer) return;
    supprimerBlagueCustom(aSupprimer);
    setASupprimer(null);
    rafraichir();
    toast.success("Blague supprimée");
  };

  const peutAjouter = titre.trim().length > 0 && texte.trim().length > 0;
  const blagueASupprimer = blagues.find(b => b.id === aSupprimer);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/preferences")}
            className="text-white hover:bg-white/20 mb-4"
            aria-label="Retour aux préférences"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-4xl font-black text-white mb-2">Mes blagues</h1>
          <p className="text-white/80">{blagues.length} blague{blagues.length > 1 ? "s" : ""} personnalisée{blagues.length > 1 ? "s" : ""}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Formulaire d'ajout */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Ajouter une blague</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block" htmlFor="titre-blague">Titre</label>
                <Input
                  id="titre-blague"
                  value={titre}
                  onChange={e => setTitre(e.target.value)}
                  placeholder="Titre de la blague..."
                  aria-label="Titre de la blague"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block" htmlFor="texte-blague">Texte</label>
                <textarea
                  id="texte-blague"
                  value={texte}
                  onChange={e => setTexte(e.target.value)}
                  placeholder="Texte de la blague..."
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Texte de la blague"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block" htmlFor="categorie-blague">Catégorie</label>
                <div className="flex gap-2">
                  <Input
                    id="categorie-blague"
                    value={categorie}
                    onChange={e => setCategorie(e.target.value)}
                    placeholder="Catégorie..."
                    list="categories-list"
                    aria-label="Catégorie de la blague"
                  />
                  <datalist id="categories-list">
                    <option value={CATEGORIE_CUSTOM} />
                    {categoriesExistantes.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>
              <Button
                onClick={handleAjouter}
                disabled={!peutAjouter}
                className="w-full"
                aria-label="Ajouter cette blague"
              >
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                Ajouter
              </Button>
            </CardContent>
          </Card>

          {/* Liste des blagues custom */}
          {blagues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Mes blagues ({blagues.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {blagues.map(b => (
                  <div key={b.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    {enEdition === b.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editTitre}
                          onChange={e => setEditTitre(e.target.value)}
                          aria-label="Modifier le titre"
                        />
                        <textarea
                          value={editTexte}
                          onChange={e => setEditTexte(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-input rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                          aria-label="Modifier le texte"
                        />
                        <Input
                          value={editCategorie}
                          onChange={e => setEditCategorie(e.target.value)}
                          aria-label="Modifier la catégorie"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSauvegarderEdition} className="flex-1" aria-label="Sauvegarder les modifications">
                            <Save className="w-4 h-4 mr-1" aria-hidden="true" />
                            Sauvegarder
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEnEdition(null)} aria-label="Annuler la modification">
                            <X className="w-4 h-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-bold text-sm">{b.titre}</div>
                            <div className="text-xs text-gray-500 mb-1">{b.categorie}</div>
                            <div className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">{b.texte}</div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCommencerEdition(b)}
                              aria-label={`Modifier la blague "${b.titre}"`}
                            >
                              <Edit className="w-4 h-4" aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:bg-red-50"
                              onClick={() => setASupprimer(b.id)}
                              aria-label={`Supprimer la blague "${b.titre}"`}
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {blagues.length === 0 && (
            <div className="text-white/80 text-center py-8">
              <p className="text-lg">Aucune blague personnalisée</p>
              <p className="text-sm mt-1">Ajoutez vos propres blagues ci-dessus !</p>
            </div>
          )}
        </motion.div>
      </div>

      <AlertDialog open={!!aSupprimer} onOpenChange={open => !open && setASupprimer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la blague</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment supprimer &quot;{blagueASupprimer?.titre}&quot; ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={handleSupprimer}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
