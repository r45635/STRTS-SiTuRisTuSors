"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, User, Edit, Trash2, Volume2, VolumeX, Sun, Moon, Monitor, BookOpen, Globe } from "lucide-react";
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
import {
  chargerProfilsJoueurs,
  supprimerProfilJoueur,
  modifierProfilJoueur,
  chargerPreferencesSonores,
  sauvegarderPreferencesSonores,
  type ProfilJoueur,
  type PreferencesSonores,
} from "@/lib/storage";
import { obtenirCategories, compterBlaguesParCategorie } from "@/lib/blagues";
import { chargerTheme, sauvegarderTheme, appliquerTheme, type Theme } from "@/lib/theme";
import { obtenirLocale, changerLocale, type Locale } from "@/lib/locale";

export default function PreferencesPage() {
  const router = useRouter();
  const [profils, setProfils] = useState<ProfilJoueur[]>([]);
  const [profilEnEdition, setProfilEnEdition] = useState<string | null>(null);
  const [profilASupprimer, setProfilASupprimer] = useState<{ id: string; nom: string } | null>(null);
  const [categoriesDisponibles] = useState<string[]>(obtenirCategories());
  const [compteurBlagues] = useState(compterBlaguesParCategorie());
  const [preferencesSonores, setPreferencesSonores] = useState<PreferencesSonores>({
    sonActif: true,
    volumeEffetsSonores: 0.7,
  });
  const [theme, setThemeState] = useState<Theme>("system");
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    chargerProfils();
    setPreferencesSonores(chargerPreferencesSonores());
    setThemeState(chargerTheme());
    setLocaleState(obtenirLocale());
  }, []);

  const changerTheme = (t: Theme) => {
    sauvegarderTheme(t);
    appliquerTheme(t);
    setThemeState(t);
  };

  const handleChangerLocale = (l: Locale) => {
    setLocaleState(l);
    changerLocale(l);
  };

  const chargerProfils = () => {
    const profilsCharges = chargerProfilsJoueurs();
    setProfils(profilsCharges.sort((a, b) => b.lastUsedAt.getTime() - a.lastUsedAt.getTime()));
  };

  const confirmerSuppression = () => {
    if (!profilASupprimer) return;
    supprimerProfilJoueur(profilASupprimer.id);
    chargerProfils();
    setProfilASupprimer(null);
  };

  const modifierProfil = (id: string, modifications: Partial<Omit<ProfilJoueur, "id">>) => {
    modifierProfilJoueur(id, modifications);
    chargerProfils();
    setProfilEnEdition(null);
  };

  const toggleSon = () => {
    const nouvellesPreferences = { ...preferencesSonores, sonActif: !preferencesSonores.sonActif };
    setPreferencesSonores(nouvellesPreferences);
    sauvegarderPreferencesSonores(nouvellesPreferences);
  };

  const changerVolume = (volume: number) => {
    const nouvellesPreferences = { ...preferencesSonores, volumeEffetsSonores: volume };
    setPreferencesSonores(nouvellesPreferences);
    sauvegarderPreferencesSonores(nouvellesPreferences);
  };

  const profilEdit = profils.find((p) => p.id === profilEnEdition);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4"
            aria-label="Retour à l'accueil"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-4xl font-black text-white mb-2">Historique & Préférences</h1>
          <p className="text-white/80">Gérez vos profils et paramètres</p>
        </motion.div>

        {/* Langue */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.01 }}
          className="mb-4"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Globe className="w-6 h-6 text-purple-500" aria-hidden="true" />
                Langue / Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Choisir la langue">
                {([
                  { value: "fr" as Locale, label: "Français 🇫🇷" },
                  { value: "en" as Locale, label: "English 🇬🇧" },
                ] as const).map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => handleChangerLocale(value)}
                    aria-pressed={locale === value}
                    className={`p-3 rounded-lg border-2 font-medium transition-all ${
                      locale === value
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Thème */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.02 }}
          className="mb-4"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                {theme === "dark" ? (
                  <Moon className="w-6 h-6 text-purple-500" aria-hidden="true" />
                ) : theme === "light" ? (
                  <Sun className="w-6 h-6 text-yellow-400" aria-hidden="true" />
                ) : (
                  <Monitor className="w-6 h-6 text-gray-400" aria-hidden="true" />
                )}
                Thème
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Choisir le thème">
                {([
                  { value: "light" as Theme, label: "Clair", Icon: Sun },
                  { value: "dark" as Theme, label: "Sombre", Icon: Moon },
                  { value: "system" as Theme, label: "Système", Icon: Monitor },
                ] as const).map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    onClick={() => changerTheme(value)}
                    aria-pressed={theme === value}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                      theme === value
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Préférences sonores */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="mb-4"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                {preferencesSonores.sonActif ? (
                  <Volume2 className="w-6 h-6 text-purple-500" aria-hidden="true" />
                ) : (
                  <VolumeX className="w-6 h-6 text-gray-400" aria-hidden="true" />
                )}
                Effets sonores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Activer les sons</h3>
                  <p className="text-sm text-gray-600">Bruitages lors des événements du jeu</p>
                </div>
                <Button
                  onClick={toggleSon}
                  variant={preferencesSonores.sonActif ? "default" : "outline"}
                  size="lg"
                  aria-pressed={preferencesSonores.sonActif}
                >
                  {preferencesSonores.sonActif ? (
                    <><Volume2 className="w-5 h-5 mr-2" aria-hidden="true" />Activé</>
                  ) : (
                    <><VolumeX className="w-5 h-5 mr-2" aria-hidden="true" />Désactivé</>
                  )}
                </Button>
              </div>

              {preferencesSonores.sonActif && (
                <div className="pt-2 border-t">
                  <label htmlFor="volume-slider" className="block mb-2">
                    <span className="font-semibold">Volume : {Math.round(preferencesSonores.volumeEffetsSonores * 100)}%</span>
                  </label>
                  <input
                    id="volume-slider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={preferencesSonores.volumeEffetsSonores}
                    onChange={(e) => changerVolume(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    aria-label="Volume des effets sonores"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Silencieux</span>
                    <span>Maximum</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Blagues personnalisées */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.07 }}
          className="mb-4"
        >
          <Card>
            <CardContent className="pt-4">
              <Link
                href="/blagues-custom"
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                aria-label="Gérer mes blagues personnalisées"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-purple-500" aria-hidden="true" />
                  <div>
                    <div className="font-semibold">Mes blagues personnalisées</div>
                    <div className="text-sm text-gray-500">Créer et gérer vos propres blagues</div>
                  </div>
                </div>
                <ArrowLeft className="w-4 h-4 rotate-180 text-gray-400" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
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
                <div className="space-y-3" role="list" aria-label="Liste des profils">
                  {profils.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200"
                      role="listitem"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0" aria-hidden="true">
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
                          aria-label={`Modifier le profil ${p.nom}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => setProfilASupprimer({ id: p.id, nom: p.nom })}
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-50"
                          aria-label={`Supprimer le profil ${p.nom}`}
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

      {/* Dialog suppression */}
      <AlertDialog open={!!profilASupprimer} onOpenChange={(open) => !open && setProfilASupprimer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le profil</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment supprimer le profil &quot;{profilASupprimer?.nom}&quot; ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={confirmerSuppression}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog édition */}
      <Dialog open={!!profilEnEdition} onOpenChange={(open) => !open && setProfilEnEdition(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
          </DialogHeader>
          {profilEdit && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block" htmlFor="edit-nom">Nom</label>
                <Input
                  id="edit-nom"
                  value={profilEdit.nom}
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
                  Catégories ({profilEdit.categoriesPreferees.length})
                </label>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Sélection des catégories">
                  {categoriesDisponibles.map((cat) => (
                    <button
                      key={cat}
                      aria-pressed={profilEdit.categoriesPreferees.includes(cat)}
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
                        profilEdit.categoriesPreferees.includes(cat)
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
                    modifierProfil(profilEnEdition!, {
                      nom: profilEdit.nom,
                      categoriesPreferees: profilEdit.categoriesPreferees,
                    })
                  }
                  className="flex-1"
                >
                  Enregistrer
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
