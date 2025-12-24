# Guide d'installation rapide

## Prérequis

Ce projet nécessite **Node.js 18+** et **npm**.

### Installation de Node.js sur macOS

#### Option 1 : Homebrew (recommandé)

1. Installer Homebrew (si pas déjà installé) :
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. Installer Node.js :
   ```bash
   brew install node
   ```

3. Vérifier l'installation :
   ```bash
   node -v
   npm -v
   ```

#### Option 2 : Téléchargement direct

1. Télécharger depuis https://nodejs.org/
2. Choisir la version LTS (Long Term Support)
3. Installer le package .pkg
4. Redémarrer le terminal

## Installation du projet

Une fois Node.js installé :

```bash
# Rendre le script exécutable
chmod +x install.sh

# Lancer l'installation
./install.sh
```

Ou manuellement :

```bash
npm install
```

## Démarrage

```bash
npm run dev
```

Ouvrir http://localhost:3000 dans votre navigateur.

## Tests

```bash
npm test
```

Pour plus d'informations, consultez le [README.md](README.md) complet.
