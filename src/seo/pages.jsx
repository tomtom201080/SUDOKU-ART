// src/seo/pages.jsx
// Source unique de vérité pour les pages SEO : consommée par les routes
// React (client), par SiteFooter (maillage interne) et par
// scripts/prerender-seo.mjs (génère le HTML statique + sitemap.xml). Toute
// page ajoutée ici apparaît automatiquement partout — jamais besoin de
// dupliquer une URL à la main.
import {
  HowItWorksContent,
  CreateChallengeContent,
  FreeContent,
  EasyContent,
  HardContent,
  ExpertContent,
  HiddenImageContent,
  SudokuArtContent
} from '../components/seo/SeoContent.jsx';

export const SEO_PAGES = [
  {
    slug: 'comment-ca-marche',
    navLabel: 'Comment ça marche',
    title: 'Comment fonctionne Sudoku Art ? – Guide complet',
    description: "Découvrez comment jouer à Sudoku Art : révélez une œuvre d'art ou une photo cachée en résolvant votre grille, seul ou en défiant vos amis.",
    h1: 'Comment fonctionne Sudoku Art ?',
    intro: 'Le principe en bref : résolvez une grille de Sudoku classique et révélez une image cachée derrière elle, case après case.',
    Content: HowItWorksContent,
    cta: { label: 'Commencer à jouer', href: '/?jouer=facile' }
  },
  {
    slug: 'creer-un-defi-sudoku',
    navLabel: 'Créer un défi',
    title: 'Créer un défi Sudoku personnalisé – Sudoku Art',
    description: 'Créez un défi Sudoku gratuit à envoyer à vos amis ou à un groupe : même grille, classement des scores, image personnalisée en option.',
    h1: 'Créez un défi Sudoku personnalisé',
    intro: 'Envoyez la même grille à un ami ou à tout un groupe, et comparez qui la termine le plus vite, avec le moins d\'erreurs et d\'indices.',
    Content: CreateChallengeContent,
    cta: { label: 'Créer mon défi', href: '/?jouer=defi' }
  },
  {
    slug: 'sudoku-gratuit',
    navLabel: 'Sudoku gratuit',
    title: 'Sudoku gratuit en ligne – Jouez sans compte | Sudoku Art',
    description: 'Jouez au Sudoku gratuitement, sans compte obligatoire, sur mobile ou ordinateur. Chaque grille terminée révèle une image cachée.',
    h1: 'Jouez au Sudoku gratuitement',
    intro: 'Toutes les grilles, tous les niveaux et toutes les images à révéler sont accessibles gratuitement, sans abonnement.',
    Content: FreeContent,
    cta: { label: 'Jouer gratuitement', href: '/?jouer=facile' }
  },
  {
    slug: 'sudoku-facile',
    navLabel: 'Sudoku facile',
    title: 'Sudoku facile – Grilles pour débutants | Sudoku Art',
    description: 'Jouez à des grilles de Sudoku facile, idéales pour débuter ou jouer en douceur, et révélez une image cachée à chaque grille terminée.',
    h1: 'Sudoku facile pour bien débuter',
    intro: 'Des grilles avec davantage de chiffres déjà placés, parfaites pour apprendre les règles ou jouer sans prise de tête.',
    Content: EasyContent,
    cta: { label: 'Jouer en facile', href: '/?jouer=facile' }
  },
  {
    slug: 'sudoku-difficile',
    navLabel: 'Sudoku difficile',
    title: 'Sudoku difficile – Grilles pour joueurs confirmés',
    description: "Relevez le défi des grilles de Sudoku difficile sur Sudoku Art : moins d'indices de départ, plus de déductions, et une image à révéler.",
    h1: 'Sudoku difficile pour les joueurs confirmés',
    intro: 'Moins de chiffres visibles au départ, des déductions plus longues à enchaîner : un vrai exercice de logique.',
    Content: HardContent,
    cta: { label: 'Jouer en difficile', href: '/?jouer=complique' }
  },
  {
    slug: 'sudoku-expert',
    navLabel: 'Sudoku expert',
    title: 'Sudoku expert – Le niveau le plus difficile | Sudoku Art',
    description: 'Testez le niveau expert de Sudoku Art, la difficulté maximale pour les joueurs aguerris, avec une image à révéler grille après grille.',
    h1: 'Sudoku niveau expert : le défi ultime',
    intro: 'Le niveau le plus exigeant de Sudoku Art, réservé aux joueurs déjà à l\'aise avec les grilles difficiles.',
    Content: ExpertContent,
    cta: { label: 'Jouer en expert', href: '/?jouer=enfer' }
  },
  {
    slug: 'sudoku-image-cachee',
    navLabel: 'Image cachée',
    title: 'Sudoku avec image cachée – Sudoku Art',
    description: 'Jouez au Sudoku et révélez progressivement une image cachée : une photo personnelle, ou une œuvre d\'art, à chaque grille.',
    h1: 'Sudoku avec image cachée : jouez et révélez',
    intro: 'Une image reste masquée derrière la grille et se dévoile petit à petit, à mesure que vous placez les bons chiffres.',
    Content: HiddenImageContent,
    cta: { label: 'Découvrir une image', href: '/?jouer=facile' }
  },
  {
    slug: 'sudoku-art',
    navLabel: 'Sudoku Art',
    title: 'Sudoku Art – Révélez des œuvres d\'art en jouant',
    description: 'Découvrez une galerie d\'œuvres d\'art célèbres en résolvant vos grilles de Sudoku sur Sudoku Art, gratuitement et sans compte obligatoire.',
    h1: 'Sudoku Art : découvrez des œuvres d\'art en jouant',
    intro: 'Chaque grille terminée en mode « œuvre d\'art » révèle un tableau célèbre à ajouter à votre galerie personnelle.',
    Content: SudokuArtContent,
    cta: { label: 'Découvrir une œuvre', href: '/?jouer=facile' }
  }
];

export function getSeoPage(slug) {
  return SEO_PAGES.find(p => p.slug === slug) ?? null;
}
