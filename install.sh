#!/bin/bash

# Script d'installation et de démarrage de STRTS

echo "🎉 Installation de STRTS - Si Tu Ris Tu Sors!"
echo ""

# Vérification de Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé sur ce système."
    echo ""
    echo "📦 Pour installer Node.js sur macOS :"
    echo "   1. Installer Homebrew si ce n'est pas fait :"
    echo "      /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    echo ""
    echo "   2. Installer Node.js :"
    echo "      brew install node"
    echo ""
    echo "   Ou téléchargez depuis : https://nodejs.org/"
    echo ""
    exit 1
fi

# Vérification de la version
NODE_VERSION=$(node -v)
echo "✅ Node.js détecté : $NODE_VERSION"

# Installation des dépendances
echo ""
echo "📦 Installation des dépendances..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances"
    exit 1
fi

echo ""
echo "✅ Installation terminée avec succès !"
echo ""
echo "🚀 Pour démarrer l'application :"
echo "   npm run dev"
echo ""
echo "📱 L'application sera accessible sur :"
echo "   http://localhost:3000"
echo ""
