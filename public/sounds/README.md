# Instructions pour ajouter les fichiers audio

Les fichiers audio suivants doivent être ajoutés dans le dossier `public/sounds/` :

## Fichiers requis :

1. **blague.mp3** - Son joué quand une blague est affichée (son positif/amusant)
2. **eliminated.mp3** - Son joué quand un joueur est éliminé (son triste/game over)
3. **victory.mp3** - Son joué quand quelqu'un gagne (fanfare de victoire)
4. **skip.mp3** - Son joué quand on refuse une blague (swoosh/skip)
5. **click.mp3** - Son joué pour les clics de boutons (clic simple)
6. **error.mp3** - Son joué en cas d'erreur (buzz d'erreur)

## Options pour obtenir les sons :

### Option 1 : Télécharger depuis des sites gratuits
- [Freesound.org](https://freesound.org) - Sons gratuits sous licence Creative Commons
- [Zapsplat.com](https://www.zapsplat.com) - Effets sonores gratuits
- [Mixkit.co](https://mixkit.co/free-sound-effects/) - Sons gratuits pour projets

### Option 2 : Générer avec des outils en ligne
- [SFXR](https://sfxr.me/) - Générateur de sons rétro pour jeux
- [ChipTone](https://sfbgames.itch.io/chiptone) - Générateur de sons 8-bit

### Option 3 : Sons placeholder temporaires
Pour le moment, l'application fonctionnera sans les sons s'ils ne sont pas présents.
Les préférences sonores sont déjà en place et fonctionnelles.

## Format recommandé :
- Format : MP3 (meilleure compatibilité navigateurs)
- Taille : < 50 KB par fichier
- Durée : 0.5 - 2 secondes maximum
- Sample rate : 44.1 kHz
- Bitrate : 128 kbps

## Note pour le développement :
Les sons sont optionnels - l'application fonctionne sans eux.
Les erreurs de chargement sont gérées silencieusement dans le code.
