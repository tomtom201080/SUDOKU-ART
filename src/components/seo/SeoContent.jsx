// src/components/seo/SeoContent.jsx
// Contenu éditorial des pages SEO. Texte français fixe (pas de useT()) :
// ces composants sont aussi rendus côté Node par scripts/prerender-seo.mjs
// via ReactDOMServer, où localStorage/navigator (utilisés par le système
// i18n) n'existent pas. Voir SeoLandingPage.jsx pour le layout partagé.
import { Link } from 'react-router-dom';

export function HowItWorksContent() {
  return (
    <>
      <h2>Le principe du jeu</h2>
      <p>
        Sudoku Art reprend les règles classiques du Sudoku : remplissez chaque ligne, chaque colonne
        et chaque bloc de 3×3 avec les chiffres de 1 à 9, sans répétition. La différence, c'est ce qui
        se cache derrière la grille. À chaque bonne case complétée, un petit morceau d'une image se
        révèle progressivement, jusqu'à découvrir l'image entière une fois la grille terminée.
      </p>

      <h2>Trois façons de jouer</h2>
      <p>
        Vous pouvez choisir de révéler une œuvre d'art tirée d'une galerie de tableaux célèbres, une
        photo personnelle que vous importez vous-même, ou jouer en mode classique sans aucune image
        si vous préférez vous concentrer sur la grille.
      </p>

      <h2>Les niveaux de difficulté</h2>
      <p>
        Quatre niveaux sont disponibles, du plus accessible au plus exigeant : facile, moyen,
        compliqué et enfer. Chaque niveau ajuste le nombre de cases vides au départ et la difficulté
        des déductions nécessaires pour les remplir.
      </p>

      <h2>Défier ses amis</h2>
      <p>
        Une fois une grille terminée, vous pouvez la renvoyer à un ami ou à un groupe entier via un
        simple lien : ils jouent exactement la même grille, et un classement compare le temps, le
        nombre d'erreurs et les indices utilisés par chacun. Voir <Link to="/creer-un-defi-sudoku">comment créer un défi Sudoku</Link>.
      </p>

      <h2>Sur mobile et ordinateur</h2>
      <p>
        Sudoku Art fonctionne directement dans le navigateur, sans installation, aussi bien sur
        smartphone, tablette que sur ordinateur.
      </p>
    </>
  );
}

export function CreateChallengeContent() {
  return (
    <>
      <h2>Qu'est-ce qu'un défi Sudoku ?</h2>
      <p>
        Un défi Sudoku permet de partager exactement la même grille avec une ou plusieurs personnes,
        puis de comparer les résultats. Chaque participant joue la grille de son côté ; à la fin, un
        classement affiche le temps, le nombre d'erreurs et les indices utilisés par chacun.
      </p>

      <h2>Défi individuel ou défi de groupe</h2>
      <p>
        Vous pouvez envoyer un défi à une seule personne pour un duel 1 contre 1, ou activer le mode
        groupe pour que toute une équipe, une famille ou une classe joue la même grille et se
        retrouve dans un classement commun. Les participants peuvent rejoindre le défi avec ou sans
        créer de compte.
      </p>

      <h2>Personnalisez votre défi avec une photo</h2>
      <p>
        Comme pour une partie classique, un défi peut révéler une œuvre d'art, une photo personnelle
        ou rester en mode classique sans image. C'est l'occasion d'envoyer un défi original avec un
        souvenir ou une photo qui prend tout son sens une fois la grille terminée.
      </p>

      <h2>Comparez vos scores</h2>
      <p>
        Le classement d'un défi tient compte du temps de résolution, mais aussi des erreurs et des
        indices utilisés : chaque erreur ou indice ajoute une pénalité de deux minutes au score final,
        pour départager équitablement les joueurs les plus rapides des plus prudents.
      </p>

      <p>
        <Link to="/sudoku-facile">Débuter avec une grille facile</Link> ou <Link to="/sudoku-difficile">tenter un défi plus corsé</Link> avant d'envoyer votre propre défi.
      </p>
    </>
  );
}

export function FreeContent() {
  return (
    <>
      <h2>Un jeu 100% gratuit</h2>
      <p>
        Sudoku Art est entièrement gratuit : toutes les grilles, tous les niveaux de difficulté et
        toutes les images à révéler sont accessibles sans payer. Aucun abonnement, aucune grille
        bloquée derrière un paiement.
      </p>

      <h2>Pas de compte obligatoire pour jouer</h2>
      <p>
        Vous pouvez commencer une grille immédiatement, sans créer de compte. Un compte gratuit reste
        utile si vous voulez retrouver votre progression, votre galerie d'images débloquées ou
        l'historique de vos défis envoyés.
      </p>

      <h2>Disponible sur tous vos appareils</h2>
      <p>
        Le jeu s'ouvre directement dans le navigateur, sur ordinateur comme sur mobile, sans rien
        installer.
      </p>

      <h2>Une récompense à chaque grille terminée</h2>
      <p>
        Contrairement à un Sudoku classique où seule la grille compte, chaque partie gratuite sur
        Sudoku Art révèle une image : une œuvre d'art à découvrir, ou une photo personnelle de votre
        choix.
      </p>

      <p>
        Envie de commencer simplement ? <Link to="/sudoku-facile">Jouez une première grille facile</Link>, ou découvrez <Link to="/sudoku-image-cachee">le principe de l'image cachée</Link>.
      </p>
    </>
  );
}

export function EasyContent() {
  return (
    <>
      <h2>Pourquoi commencer par le niveau facile</h2>
      <p>
        Le niveau facile de Sudoku Art est pensé pour les joueurs débutants ou pour une partie
        détendue : davantage de chiffres sont déjà placés au départ, ce qui limite les déductions
        complexes et rend la grille plus rapide à compléter.
      </p>

      <h2>Apprendre les règles du Sudoku en jouant</h2>
      <p>
        Chaque ligne, chaque colonne et chaque bloc de 3×3 doit contenir une seule fois les chiffres
        de 1 à 9. Une grille facile permet d'assimiler ce principe sans se bloquer sur une case
        difficile à déduire.
      </p>

      <h2>Progresser à son rythme</h2>
      <p>
        Une fois à l'aise avec le niveau facile, rien n'empêche de tenter directement une grille{' '}
        <Link to="/sudoku-difficile">plus difficile</Link> ou de monter jusqu'au niveau{' '}
        <Link to="/sudoku-expert">expert</Link>. Chaque grille facile termine aussi par la révélation
        d'une image, comme n'importe quel autre niveau.
      </p>
    </>
  );
}

export function HardContent() {
  return (
    <>
      <h2>Un vrai défi logique</h2>
      <p>
        Le niveau compliqué de Sudoku Art laisse beaucoup moins de chiffres visibles au départ. Il
        faut enchaîner plusieurs déductions avant de pouvoir remplir la première case avec certitude.
      </p>

      <h2>Des techniques plus poussées</h2>
      <p>
        Sur une grille difficile, les techniques de base (élimination simple par ligne ou colonne) ne
        suffisent plus toujours. Il devient utile de repérer les paires ou triplets de chiffres
        candidats possibles dans une même zone pour avancer.
      </p>

      <h2>Repousser vos limites</h2>
      <p>
        Si le niveau difficile devient trop confortable, le niveau <Link to="/sudoku-expert">expert</Link>{' '}
        pousse l'exercice encore plus loin. À l'inverse, une grille <Link to="/sudoku-facile">facile</Link>{' '}
        reste toujours disponible pour une partie plus détendue.
      </p>
    </>
  );
}

export function ExpertContent() {
  return (
    <>
      <h2>Le niveau le plus exigeant de Sudoku Art</h2>
      <p>
        Le niveau expert propose les grilles avec le moins de chiffres visibles au départ et les
        déductions les plus longues à enchaîner. C'est le niveau le plus adapté aux joueurs déjà à
        l'aise avec le Sudoku classique.
      </p>

      <h2>Pour qui est fait ce niveau</h2>
      <p>
        Si vous terminez régulièrement les grilles <Link to="/sudoku-difficile">difficiles</Link> sans
        indice, le niveau expert est l'étape suivante : il demande de la patience et une lecture fine
        de la grille avant chaque coup.
      </p>

      <h2>Des défis à la hauteur du niveau</h2>
      <p>
        Comme sur les autres niveaux, une grille expert terminée révèle une image et peut être{' '}
        <Link to="/creer-un-defi-sudoku">envoyée en défi</Link> à d'autres joueurs pour voir qui la
        termine le plus vite, avec le moins d'erreurs et d'indices possible.
      </p>
    </>
  );
}

export function HiddenImageContent() {
  return (
    <>
      <h2>Le principe de l'image cachée</h2>
      <p>
        Sur Sudoku Art, une image se cache derrière chaque grille. Elle reste floue ou masquée au
        début de la partie, puis se révèle petit à petit à chaque case correctement remplie, jusqu'à
        apparaître entièrement quand la grille est terminée.
      </p>

      <h2>Une photo personnelle ou une œuvre d'art</h2>
      <p>
        L'image à révéler peut être une photo que vous importez vous-même — un souvenir, un portrait,
        une photo de vacances — ou une œuvre d'art choisie dans une galerie de tableaux célèbres. Voir
        la page dédiée à <Link to="/sudoku-art">Sudoku Art et aux œuvres à découvrir</Link>.
      </p>

      <h2>Un jeu qui garde son intérêt jusqu'à la fin</h2>
      <p>
        Contrairement à une grille de Sudoku classique où seule la dernière case compte, l'image
        cachée donne une bonne raison de continuer à jouer même quand la grille se complique : chaque
        chiffre placé rapproche un peu plus de la révélation complète.
      </p>

      <p>
        C'est aussi une façon originale de préparer <Link to="/creer-un-defi-sudoku">un défi personnalisé</Link>{' '}
        pour un ami ou un proche.
      </p>
    </>
  );
}

export function SudokuArtContent() {
  return (
    <>
      <h2>Une galerie d'œuvres d'art à débloquer</h2>
      <p>
        En mode « œuvre d'art », chaque grille de Sudoku terminée révèle un tableau tiré d'une
        galerie d'œuvres célèbres. Plus vous jouez, plus votre galerie personnelle se remplit
        d'œuvres découvertes.
      </p>

      <h2>Apprendre en jouant</h2>
      <p>
        Une fois l'œuvre révélée, quelques informations l'accompagnent : le titre, l'artiste, et
        parfois un détail ou une anecdote sur le tableau. Une manière discrète de découvrir de
        l'histoire de l'art entre deux grilles.
      </p>

      <h2>Choisir son niveau, garder la surprise</h2>
      <p>
        L'œuvre révélée dépend du niveau choisi : <Link to="/sudoku-facile">facile</Link>,{' '}
        <Link to="/sudoku-difficile">difficile</Link> ou <Link to="/sudoku-expert">expert</Link>. Le
        principe reste le même à chaque niveau : plus la grille progresse, plus le tableau se dévoile.
      </p>

      <p>
        Vous préférez révéler une photo personnelle plutôt qu'une œuvre d'art ? Le principe est
        détaillé sur la page <Link to="/sudoku-image-cachee">Sudoku avec image cachée</Link>.
      </p>
    </>
  );
}
