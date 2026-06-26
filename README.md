# Sudoku Dévoilé

PWA de sudoku (React + Vite) à trois niveaux de difficulté, avec une image
en filigrane derrière la grille qui se dévoile case par case au fil de la
partie, et une bibliothèque d'images débloquables organisée par saison.

## Configuration des comptes (Supabase Auth)

L'appli utilise un vrai système de compte (email + mot de passe) via Supabase.

1. Crée un fichier `.env` à la racine du projet (copie `.env.example`) :
```bash
cp .env.example .env
```
2. Va sur ton dashboard Supabase → **Project Settings → API**, et remplis :
   - `VITE_SUPABASE_URL` avec la "Project URL"
   - `VITE_SUPABASE_ANON_KEY` avec la clé "anon public"
3. Relance `npm run dev` (le fichier `.env` n'est jamais commité sur Git).

Sur Vercel, ajoute ces deux mêmes variables dans **Project Settings → Environment Variables** pour que la version en ligne fonctionne aussi.

L'inscription envoie un email de confirmation par défaut (paramètre Supabase
standard) — l'utilisateur doit cliquer le lien reçu avant de pouvoir se
connecter. Tu peux désactiver cette confirmation dans Supabase → Authentication
→ Providers → Email si tu préfères une inscription immédiate sans email.

## Installation

```bash
npm install
npm run dev
```

Build de production :

```bash
npm run build
npm run preview
```

Déploiement Vercel : projet Vite standard, aucune config particulière
nécessaire (build command `npm run build`, output `dist`).

## Principe du jeu

- 3 difficultés : **Moyen**, **Compliqué**, **Enfer** (de moins en moins de
  chiffres donnés au départ).
- Pendant la partie, une image est tirée au hasard et affichée en filigrane
  derrière la grille. Chaque case que tu remplis correctement "découvre" le
  morceau d'image correspondant. Les cases données au départ sont déjà
  révélées.
- À la fin d'une grille complète et correcte, une image est **débloquée
  définitivement** dans la Galerie. La rareté de l'image dépend de la
  difficulté choisie :
  - Moyen → image **commune**
  - Compliqué → image **rare**
  - Enfer → image **légendaire**
- La Galerie est accessible à tout moment depuis le bouton "🖼 Galerie",
  mais ne contient que les images déjà débloquées.

## Alimenter la bibliothèque d'images (saisons)

Tout se passe dans `public/images/`.

```
public/images/
  manifest.json
  printemps/
    commune/
    rare/
    legendaire/
  ete/
    commune/
    rare/
    legendaire/
  automne/
    commune/
    rare/
    legendaire/
  hiver/
    commune/
    rare/
    legendaire/
```

Pour ajouter une image :

1. Dépose le fichier image (jpg/png/webp) dans le bon dossier, par exemple
   `public/images/ete/rare/coucher-de-soleil.jpg`.
2. Ajoute le nom du fichier dans `public/images/manifest.json`, sous la
   bonne saison et le bon tier :

```json
{
  "ete": {
    "commune": ["plage.jpg"],
    "rare": ["coucher-de-soleil.jpg"],
    "legendaire": []
  }
}
```

3. C'est tout — aucun redéploiement de code n'est nécessaire si tu modifies
   juste les images et le manifeste (ce sont des fichiers statiques).

La saison "active" est calculée automatiquement à partir de la date du jour
(hémisphère nord : printemps mars-mai, été juin-août, automne sept-nov,
hiver déc-fév). Le filigrane en partie pioche dans la saison en cours
(toutes raretés confondues) ; si la saison en cours est vide, l'app retombe
sur l'ensemble de la bibliothèque.

## Notes techniques

- Génération de grille : backtracking avec vérification d'unicité de la
  solution (`src/sudoku/generator.js`).
- Effet de dévoilement : chaque case affiche une tranche de l'image en
  fond (`background-size: 900% 900%` + position calculée), recouverte d'un
  cache qui disparaît en fondu quand la case est correcte
  (`src/components/SudokuBoard.jsx` / `.css`).
- Stockage local uniquement (`localStorage`) pour la galerie débloquée et
  les statistiques de victoires — pas de backend nécessaire pour cette V1.
  Si tu veux synchroniser la galerie entre appareils via un compte, on peut
  brancher Supabase (auth + table `unlocked_images`) sur le même modèle que
  tes autres projets.
- PWA : `vite-plugin-pwa` est configuré (manifest + service worker). Les
  icônes `public/icon-192.png` et `public/icon-512.png` sont des
  placeholders à remplacer par ton propre visuel.
