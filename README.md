# STRTS - Si Tu Ris Tu Sors ! 🎉

**Version 1.0.0 - MVP**

Une application web mobile-first en pass-and-play pour jouer au célèbre jeu "Si Tu Ris Tu Sors" avec vos amis !

## 📖 Description

STRTS est un jeu social qui se joue sur un seul appareil. Les joueurs se relaient pour lire des blagues et doivent s'éliminer eux-mêmes s'ils rient. Le dernier joueur en lice remporte la partie !

### Caractéristiques principales

- 🎮 **Pass-and-play** : tout le monde joue sur le même appareil
- 📱 **Mobile-first** : optimisé pour smartphones et tablettes
- 🎨 **Interface fun et colorée** : design moderne avec animations
- 💾 **Sauvegarde automatique** : reprenez votre partie à tout moment
- 🎯 **Catégories personnalisables** : communes ou par joueur
- 🎲 **Ordre aléatoire ou fixe** : choisissez votre mode de jeu
- ⛔ **Système de refus** : 2 refus maximum par joueur
- 🏆 **Statistiques de fin** : suivez les performances de chaque joueur

## 🎯 Règles du jeu

### Configuration de la partie

1. **Nom de la partie** : Donnez un nom à votre session
2. **Mode de catégories** :
   - **Communes** : Tous les joueurs reçoivent des blagues des mêmes catégories
   - **Par joueur** : Chaque joueur sélectionne ses propres catégories
3. **Ordre des tours** :
   - **Inscription** : Les joueurs jouent dans l'ordre d'ajout
   - **Aléatoire** : L'ordre est mélangé au démarrage (une seule fois)

### Déroulement

1. **Tour de jeu** :
   - Le joueur courant appuie sur "Je suis prêt !"
   - Une blague s'affiche (image + texte)
   - Le joueur peut :
     - Passer au joueur suivant
     - Refuser la blague (max 2 refus par partie)
     - S'éliminer ("Je ris : je sors !")

2. **Refus de blague** :
   - Chaque joueur a droit à 2 refus maximum
   - La blague refusée peut ressortir plus tard pour d'autres joueurs
   - Un nouveau tirage est effectué immédiatement

3. **Élimination** :
   - **Auto-déclaration** : N'importe quel joueur peut s'éliminer à tout moment
   - Via le bouton "Je ris : je sors !" (élimine le joueur courant)
   - Via le menu > "Éliminer un joueur" (sélection multiple)
   - Si le joueur courant est éliminé, on passe automatiquement au suivant

4. **Fin de partie** :
   - La partie se termine quand il ne reste qu'un seul joueur
   - Affichage du gagnant et des statistiques complètes

### Système de blagues

- **Sans répétition** : Aucune blague ne peut être tirée deux fois dans la même partie
- **Filtrage** : Seules les blagues avec du texte sont affichées
- **Catégories** : Filtrage selon le mode choisi (communes ou par joueur)

## 🚀 Installation

### Prérequis

- Node.js 18+ installé
- npm ou yarn

### Étapes

1. **Cloner le dépôt**
   ```bash
   git clone <url-du-repo>
   cd STRTS-SiTuRisTuSors
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Lancer en développement**
   ```bash
   npm run dev
   ```

4. **Ouvrir l'application**
   - Navigateur : http://localhost:3000
   - Ou scannez le QR code avec votre smartphone

5. **Build pour production** (optionnel)
   ```bash
   npm run build
   npm start
   ```

## 🧪 Tests

Lancer les tests unitaires :

```bash
npm test
```

Avec interface visuelle :

```bash
npm run test:ui
```

### Couverture des tests

Les tests couvrent le **game engine** complet :
- ✅ Création de joueurs et de parties
- ✅ Tirage de blagues sans répétition
- ✅ Système de refus (max 2)
- ✅ Navigation entre joueurs
- ✅ Élimination et fin de partie
- ✅ Recommencer une partie
- ✅ Ordre aléatoire vs inscription

## 📁 Architecture du projet

```
STRTS-SiTuRisTuSors/
├── app/                      # Routes Next.js (App Router)
│   ├── page.tsx             # Page d'accueil
│   ├── setup/               # Configuration de partie
│   │   ├── page.tsx         # Étape 1 : Config générale
│   │   └── joueurs/         
│   │       └── page.tsx     # Étape 2 : Ajout joueurs
│   ├── game/                # Jeu principal
│   │   └── page.tsx         # Écrans de jeu (tour, révélation, menu, victoire)
│   ├── layout.tsx           # Layout principal
│   └── globals.css          # Styles globaux
│
├── components/              # Composants UI réutilisables
│   └── ui/                  # Composants shadcn/ui
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── ...
│
├── lib/                     # Logique métier
│   ├── game.ts             # 🎮 Game engine (logique pure)
│   ├── blagues.ts          # 📚 Chargement et gestion des blagues
│   ├── storage.ts          # 💾 Persistance localStorage
│   └── utils.ts            # 🛠️ Utilitaires
│
├── types/                   # Types TypeScript
│   └── index.ts            # Tous les types (Blague, Joueur, EtatPartie, etc.)
│
├── data/                    # Données statiques
│   └── all_blagues.json    # Base de blagues (5000+)
│
├── __tests__/              # Tests unitaires
│   └── game.test.ts        # Tests du game engine
│
├── public/                  # Assets statiques
├── package.json            # Dépendances et scripts
├── tsconfig.json           # Configuration TypeScript
├── tailwind.config.ts      # Configuration Tailwind CSS
├── vitest.config.ts        # Configuration tests
└── next.config.js          # Configuration Next.js
```

## 🧩 Stack technique

### Framework & Langages

- **Next.js 14** (App Router) - Framework React
- **TypeScript** - Typage statique
- **React 18** - Bibliothèque UI

### UI & Styling

- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Composants UI modernes
- **Framer Motion** - Animations et transitions
- **Lucide React** - Icônes

### Gestion d'état & Données

- **localStorage** - Persistance côté client
- **sessionStorage** - État temporaire (config setup)
- JSON statique - Base de blagues

### Tests

- **Vitest** - Framework de tests
- **@testing-library/react** - Tests de composants
- **jsdom** - Environnement DOM simulé

## 🎨 Design & UX

### Principes

- **Mobile-first** : Conçu d'abord pour smartphones
- **Accessibilité** : Boutons larges, texte lisible, contraste élevé
- **Animations légères** : Transitions fluides sans surcharge
- **Couleurs vives** : Dégradés purple/pink/orange pour une ambiance fun

### Écrans

1. **Accueil** : Nouvelle partie, Reprendre, Préférences
2. **Setup Config** : Nom, mode catégories, ordre tours
3. **Setup Joueurs** : Ajout joueurs + catégories (si mode parJoueur)
4. **Tour** : Affichage du joueur courant + bouton "Je suis prêt"
5. **Révélation** : Grande image + texte de la blague
6. **Menu** : Pause, Éliminer, Recommencer, Abandonner
7. **Victoire** : Gagnant + statistiques détaillées

## 📊 Données (Blagues)

### Structure JSON

```json
{
  "image_url": "https://...",
  "title": "Titre de la blague",
  "text": "Texte de la blague",
  "category": "tonton"
}
```

### Transformation

Le fichier JSON est chargé et transformé :

```typescript
{
  id: string,           // Hash MD5 généré (imageUrl + title + category)
  imageUrl: string,     // URL de l'image
  titre: string,        // Titre
  texte: string,        // Contenu
  categorie: string     // Catégorie
}
```

### Catégories disponibles

Récupérées dynamiquement depuis le fichier JSON (unique values).

## 💾 Persistance

### localStorage

**Clés utilisées** :

- `strts_profils_joueurs` : Array de ProfilJoueur
- `strts_partie_en_cours` : EtatPartieSauvegarde (sérialisé)

**ProfilJoueur** :
```typescript
{
  id: string,
  nom: string,
  categoriesPreferees: string[],
  nbPartiesJouees: number,
  lastUsedAt: Date
}
```

**EtatPartieSauvegarde** :
- Configuration complète
- Liste des joueurs avec état
- Blagues utilisées (Set → Array)
- Blague actuelle
- Index joueur courant
- Dates de début/fin

### sessionStorage

- `strts_config` : Configuration temporaire pendant le setup

## 🔧 Développement

### Scripts disponibles

```bash
npm run dev         # Développement (hot reload)
npm run build       # Build production
npm start           # Serveur production
npm run lint        # Vérification ESLint
npm test            # Tests unitaires
npm run test:ui     # Tests avec interface
```

### Ajouter des blagues

1. Modifier `data/all_blagues.json`
2. Respecter la structure existante
3. Les IDs sont générés automatiquement

### Modifier les règles

Toute la logique est dans `lib/game.ts` (fonctions pures et testables).

## 🌐 Déploiement

### Vercel (recommandé)

1. Connecter votre repo GitHub
2. Déploiement automatique
3. Aucune configuration nécessaire

### Autre plateforme

```bash
npm run build
npm start
```

Servir le dossier `.next` avec Node.js.

## 🐛 Problèmes connus (MVP)

- Pas de backend (tout en local)
- Images externes non optimisées (utilisation de `<img>` standard)
- Pas d'historique de parties
- Pas de profils joueurs enrichis
- Pas de mode multijoueur distant

## 🚀 Évolutions futures (V2+)

- [ ] Backend pour statistiques globales
- [ ] Mode multijoueur en ligne
- [ ] Ajout de blagues par les utilisateurs
- [ ] Système de niveaux/achievements
- [ ] Partage des scores sur réseaux sociaux
- [ ] PWA avec installation sur l'écran d'accueil
- [ ] Son et effets sonores
- [ ] Mode sombre
- [ ] Internationalisation (i18n)

## 📄 Licence

Ce projet est un MVP éducatif. Les blagues proviennent de sources publiques.

## 👥 Contribution

Les contributions sont les bienvenues ! Merci de :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amelioration`)
3. Commit (`git commit -m 'Ajout fonctionnalité X'`)
4. Push (`git push origin feature/amelioration`)
5. Ouvrir une Pull Request

## 🎮 Bon jeu !

Amusez-vous bien et essayez de ne pas rire ! 😄

---

**Développé avec ❤️ en utilisant Next.js, TypeScript, et Tailwind CSS**
