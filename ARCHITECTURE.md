# Architecture du projet STRTS

Ce document décrit l'architecture et l'organisation du code de STRTS.

## 📂 Structure des dossiers

```
STRTS-SiTuRisTuSors/
│
├── app/                          # 🎯 Routes Next.js (App Router)
│   ├── page.tsx                 # Page d'accueil
│   ├── layout.tsx               # Layout global (ThemeProvider, i18n, Analytics)
│   ├── globals.css              # Styles globaux (thèmes clair/sombre)
│   │
│   ├── setup/                   # 🎨 Configuration de partie
│   │   ├── page.tsx            # Étape 1: Config (catégories, ordre)
│   │   └── joueurs/
│   │       └── page.tsx        # Étape 2: Ajout joueurs
│   │
│   ├── game/                    # 🎮 Jeu principal
│   │   └── page.tsx            # Orchestrateur des écrans de jeu
│   │
│   ├── preferences/            # ⚙️ Préférences (son, thème, langue)
│   ├── blagues-custom/         # ✍️ Blagues créées par l'utilisateur
│   ├── auth/                   # 🔐 Authentification Supabase
│   │   ├── connexion/         # Connexion / inscription
│   │   └── callback/          # Callback OAuth
│   └── multijoueur/            # 🌐 Mode multijoueur distant
│       └── salle/             # Salle de jeu en temps réel
│
├── components/                   # 🧩 Composants réutilisables
│   ├── ThemeProvider.tsx       # Contexte thème clair/sombre
│   ├── Analytics.tsx           # Intégration Plausible
│   ├── game/                   # Écrans de jeu (extraits de game/page.tsx)
│   │   ├── EcranTour.tsx
│   │   ├── EcranRevelation.tsx
│   │   ├── EcranMenu.tsx
│   │   ├── EcranEliminer.tsx
│   │   ├── EcranJeRisJeSors.tsx
│   │   └── EcranVictoire.tsx
│   └── ui/                      # Composants shadcn/ui
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── textarea.tsx
│       ├── dialog.tsx
│       └── alert-dialog.tsx
│
├── lib/                         # 🔧 Logique métier (CORE)
│   ├── game.ts                 # 🎲 Game engine (fonctions pures)
│   ├── blagues.ts              # 📚 Chargement des blagues
│   ├── blagues-custom.ts       # ✍️ CRUD blagues utilisateur
│   ├── storage.ts              # 💾 Persistance localStorage
│   ├── supabase.ts             # 🔌 Client Supabase
│   ├── auth.ts                 # 🔐 Session / authentification
│   ├── multijoueur.ts          # 🌐 Logique multijoueur (Realtime)
│   ├── votes.ts                # 👍 Votes / stats côté serveur
│   ├── theme.ts                # 🌗 Gestion du thème
│   ├── locale.ts               # 🌍 Détection / bascule de langue
│   ├── sound.ts                # 🔊 Bruitages
│   └── utils.ts                # 🛠️ Utilitaires divers
│
├── i18n/                        # 🌍 Configuration next-intl
├── messages/                    # 🌍 Traductions (fr, en, …)
│
├── types/                       # 📝 Types TypeScript
│   ├── index.ts                # Types métier
│   └── supabase.ts             # Types générés de la base
│
├── data/                        # 📊 Données statiques
│   └── all_blagues.json        # Base de ~845 blagues
│
├── supabase/                    # 🗄️ Backend
│   └── schema.sql              # Schéma SQL (tables, RLS)
│
├── __tests__/                   # 🧪 Tests unitaires
│   └── game.test.ts            # Tests du game engine
│
├── public/                      # 🌐 Assets publics (+ service worker PWA généré)
│
└── config files                 # ⚙️ Configuration
    ├── package.json            # Dépendances
    ├── tsconfig.json           # TypeScript
    ├── tailwind.config.ts      # Tailwind CSS
    ├── vitest.config.ts        # Tests
    ├── next.config.js          # Next.js (+ next-pwa, next-intl)
    ├── vercel.json             # Config déploiement Vercel
    └── postcss.config.js       # PostCSS
```

> **Note V2.0** — L'architecture initiale (game engine local + localStorage) reste le cœur du jeu en pass-and-play. Les couches ajoutées (Supabase, multijoueur, auth, i18n, thèmes, PWA, blagues custom) sont **optionnelles** : le jeu solo fonctionne sans backend ni variables d'environnement.

## 🏗️ Principes d'architecture

### 1. Séparation des responsabilités

- **`app/`** : UI et navigation (React, Next.js)
- **`lib/`** : Logique métier pure (pas de React, testable)
- **`components/`** : Composants UI réutilisables
- **`types/`** : Contrats TypeScript

### 2. Game Engine pur (`lib/game.ts`)

**Fonctions immuables** : ne modifient jamais les objets en entrée.

```typescript
// ❌ Mutation (à éviter)
function eliminer(partie: EtatPartie, id: string) {
  partie.joueurs.find(j => j.id === id).estElimine = true;
  return partie;
}

// ✅ Immutabilité (correct)
function eliminerJoueurs(partie: EtatPartie, ids: string[]) {
  return {
    ...partie,
    joueurs: partie.joueurs.map(j =>
      ids.includes(j.id) ? { ...j, estElimine: true } : j
    )
  };
}
```

**Avantages** :
- Facilement testable
- Pas d'effets de bord
- Prévisible et debuggable
- Peut être utilisé côté serveur

### 3. Persistance (`lib/storage.ts`)

Abstraction du localStorage :
- Sérialisation/désérialisation automatique
- Gestion des erreurs
- Conversion Set ↔ Array
- Conversion Date ↔ ISO string

### 4. UI États multiples (`app/game/page.tsx`)

Un seul composant gère tous les écrans de jeu :

```typescript
type EcranType = "tour" | "revelation" | "menu" | "eliminer" | "victoire";
```

Utilise `<AnimatePresence>` de Framer Motion pour les transitions.

## 🔄 Flux de données

### Création de partie

```
Accueil
  ↓
Setup Config (sessionStorage)
  ↓
Setup Joueurs
  ↓
creerPartie() → EtatPartie
  ↓
sauvegarderPartieEnCours() → localStorage
  ↓
Redirection /game
```

### Tour de jeu

```
Joueur courant affiché
  ↓
"Je suis prêt !" cliqué
  ↓
tirerBlague() → Blague
  ↓
revelerBlague() → EtatPartie mis à jour
  ↓
Affichage blague
  ↓
"Joueur suivant" OU "Refuser"
  ↓
passerAuJoueurSuivant() OU refuserBlague()
  ↓
Sauvegarde localStorage
```

### Élimination

```
Bouton "Je ris : je sors !"
  ↓
eliminerJoueurs([joueurCourant.id])
  ↓
Vérification fin de partie
  ↓
Si 1 seul joueur → Victoire
  ↓
Sinon → Joueur suivant
```

## 📊 Modèle de données

### Types principaux

```typescript
// Blague transformée
interface Blague {
  id: string;              // Hash stable
  imageUrl: string;
  titre: string;
  texte: string;
  categorie: string;
}

// Joueur dans une partie
interface Joueur {
  id: string;              // UUID
  nom: string;
  categoriesPreferees: string[];
  refusRestants: number;   // Max 2
  estElimine: boolean;
  nbBlagues: number;
}

// État complet de la partie
interface EtatPartie {
  configuration: ConfigurationPartie;
  joueurs: Joueur[];
  ordreJoueurs: string[];          // IDs fixés au démarrage
  indexJoueurCourant: number;
  blagues: Blague[];
  blaguesUtilisees: Set<string>;   // Pas de répétition
  blagueRefuseeId?: string;        // Éviter re-tirage immédiat
  blagueActuelle?: Blague;
  estTerminee: boolean;
  gagnantId?: string;
  dateDebut: Date;
  dateFin?: Date;
}
```

### Règles métier implémentées

1. **Tirage sans répétition**
   - `blaguesUtilisees` (Set) stocke tous les IDs vus
   - Filtre avant tirage : `!blaguesUtilisees.has(id)`

2. **Refus de blague (max 2)**
   - `refusRestants` initialisé à 2
   - Décrémenté à chaque refus
   - Blague refusée retirée de `blaguesUtilisees`
   - `blagueRefuseeId` pour éviter re-tirage immédiat

3. **Ordre des tours**
   - `ordreJoueurs` fixé à `creerPartie()`
   - Si aléatoire : shuffle une seule fois
   - Si inscription : ordre des joueurs[]
   - Navigation circulaire avec modulo

4. **Élimination**
   - Flag `estElimine` sur le joueur
   - Saut automatique dans `passerAuJoueurSuivant()`
   - Fin si `joueursActifs.length <= 1`

## 🧪 Tests

### Stratégie de test

Focus sur le **game engine** (logique critique) :

```typescript
describe("Game Engine - Tirage de blagues", () => {
  it("ne devrait pas tirer deux fois la même blague", () => {
    // Arrange
    const partie = creerPartie(...);
    
    // Act
    const blague1 = tirerBlague(partie);
    partie = revelerBlague(partie, blague1.blague);
    const blague2 = tirerBlague(partie);
    
    // Assert
    expect(blague2.blague.id).not.toBe(blague1.blague.id);
  });
});
```

**Couverture** :
- ✅ Création de partie
- ✅ Tirage sans répétition
- ✅ Refus max 2
- ✅ Navigation joueurs
- ✅ Élimination
- ✅ Ordre aléatoire vs inscription

## 🎨 UI/UX

### Design System

**Couleurs** (Tailwind) :
- Primary : Purple (`bg-purple-500`)
- Secondary : Pink (`bg-pink-500`)
- Accent : Orange (`bg-orange-400`)
- Success : Green (`bg-green-500`)
- Danger : Red (`bg-red-500`)

**Composants** (shadcn/ui) :
- Button (variants: default, destructive, outline, ghost)
- Card (structure: Header, Content, Footer)
- Input (formulaires)

**Animations** (Framer Motion) :
- `initial` / `animate` / `exit`
- `<AnimatePresence mode="wait">` pour transitions d'écrans
- Micro-animations sur boutons (scale, opacity)

### Responsive

**Breakpoints Tailwind** :
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px

**Mobile-first** :
- Classes sans préfixe = mobile
- Ajout progressif de `md:` et `lg:` si besoin

## 🚀 Performance

### Optimisations

1. **Images** : `<img>` standard (pas d'optimisation Next.js en MVP)
2. **Bundle** : Code-splitting automatique (App Router)
3. **Client-side only** : Tout en CSR (pas de SSR nécessaire)
4. **localStorage** : Lectures minimales, écritures à chaque update

### Limitations connues

- Pas de lazy-loading des blagues (toutes chargées au démarrage)
- Pas de virtualisation pour longues listes
- Images externes non optimisées

## 📝 Conventions de code

### Nommage

- **Français** : Types, variables métier (`Joueur`, `tirerBlague`)
- **camelCase** : Variables, fonctions (`joueurCourant`, `passerAuSuivant`)
- **PascalCase** : Types, composants (`EtatPartie`, `GamePage`)

### Commentaires

Tous les commentaires en **français** :

```typescript
/**
 * Tire une blague au hasard pour le joueur courant
 * Respecte les règles: sans répétition, dans les catégories autorisées
 */
export function tirerBlague(partie: EtatPartie): ResultatTirage {
  // ...
}
```

## 🔐 Sécurité

Le jeu solo reste 100 % local (aucune donnée sensible). Les fonctions en ligne
(multijoueur, blagues partagées, votes) s'appuient sur Supabase :

- **Authentification** : Supabase Auth (`lib/auth.ts`, `app/auth/`)
- **Autorisation** : Row Level Security (RLS) définie dans `supabase/schema.sql`
- **Clés** : seule la clé `anon` publique est exposée côté client (`NEXT_PUBLIC_*`) ;
  ne jamais committer `.env*.local` (déjà ignoré par git). Voir `.env.example`.

**Limitations** :
- localStorage accessible en clair (état de partie local)
- Validation métier principalement côté client pour le mode solo

## 🌍 Déploiement

### Vercel

1. Push sur GitHub
2. Connecter Vercel
3. Déploiement automatique

### Build

```bash
npm run build   # Génère .next/
npm start       # Serveur production (port 3000)
```

## 📚 Ressources

- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vitest](https://vitest.dev/)
