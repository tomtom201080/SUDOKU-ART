# Mesure d'audience (GA4 + Clarity)

Ce document explique comment configurer, vérifier et lire le tracking mis
en place pour comprendre l'usage du jeu avant son lancement public.

## 1. Créer / retrouver les identifiants

### Google Analytics 4

1. Va sur [analytics.google.com](https://analytics.google.com).
2. Si tu n'as pas encore de propriété : **Admin → Créer → Propriété**, type
   "Web", donne-lui un nom (ex: "Sudoku Art").
3. Dans la propriété : **Admin → Flux de données → Ajouter un flux → Web**,
   renseigne l'URL du site (`https://sudokuart.com`).
4. Le flux créé affiche un **ID de mesure** au format `G-XXXXXXXXXX`. C'est
   la valeur à mettre dans `VITE_GA_MEASUREMENT_ID`.

### Microsoft Clarity

1. Va sur [clarity.microsoft.com](https://clarity.microsoft.com) et connecte-toi
   (compte Microsoft, gratuit).
2. **Add new project**, donne un nom, renseigne l'URL du site.
3. Sur la page du projet : **Settings → Setup** affiche un extrait de code
   contenant `clarity.ms/tag/XXXXXXXXXX` — le `XXXXXXXXXX` est le
   **Project ID** à mettre dans `VITE_CLARITY_PROJECT_ID`.

## 2. Renseigner les variables sur Vercel

1. Dashboard Vercel → ton projet → **Settings → Environment Variables**.
2. Ajoute (environnement Production, et Preview si tu veux tester avant) :
   - `VITE_GA_MEASUREMENT_ID` = ton ID GA4
   - `VITE_CLARITY_PROJECT_ID` = ton ID Clarity
   - `VITE_ANALYTICS_ENABLED` = `true`
3. Redéploie (un nouveau push suffit, ou "Redeploy" depuis le dashboard).

Tant que ces variables sont vides, aucun script GA4/Clarity n'est chargé et
aucune erreur n'est levée — le jeu fonctionne normalement.

## 3. Vérifier que les événements arrivent (GA4 DebugView)

1. Installe l'extension navigateur **Google Analytics Debugger**, ou passe
   simplement `VITE_ANALYTICS_FORCE_LOCAL=true` dans ton `.env` local pour
   tester en développement (`npm run dev`).
2. Dans GA4 : **Admin → DebugView**.
3. Ouvre le jeu, accepte la mesure d'audience dans le bandeau de
   consentement, joue une partie.
4. Les événements (`home_viewed`, `game_started`, `first_move`,
   `game_progress`, `game_completed`...) doivent apparaître dans DebugView
   en quasi temps réel, avec leurs paramètres.

En parallèle, ouvre la console du navigateur : chaque événement envoyé (ou
qui aurait été envoyé sans consentement/identifiant) s'affiche sous la
forme `[Analytics Debug] nom_evenement {...}` tant que le mode debug est
actif (actif par défaut en développement, voir `VITE_ANALYTICS_DEBUG`).

## 4. Retrouver une session dans Clarity

1. Dashboard Clarity → ton projet → **Recordings**.
2. Utilise les filtres à gauche : Clarity indexe automatiquement les tags
   posés par l'app (`language`, `device`, `difficulty`, `content_type`,
   `game_result`, `had_error`) — cherche-les dans la liste de filtres sous
   "Custom tags" (le délai d'indexation peut être de quelques minutes à
   quelques heures selon le volume).
3. Filtres utiles pour un audit avant lancement :
   - `had_error = true` → sessions ayant rencontré une erreur JS.
   - `game_result = abandoned` → parties abandonnées.
   - `game_result = completed` → parties terminées (pour comparer le
     comportement "normal").
   - Combine avec `device` pour isoler les soucis mobile-only.
4. Clarity fournit aussi nativement des filtres "Rage clicks", "Dead
   clicks", "Quick backs" (retours rapides) et "JS errors" dans le menu de
   gauche, sans configuration supplémentaire côté code.

## 5. Lire l'entonnoir dans GA4

Dans **Explorer → Entonnoir Exploration**, construis les étapes suivantes,
dans l'ordre :

```
home_viewed
→ game_selected
→ game_started
→ first_move
→ game_progress (progress_percent = 25)
→ game_progress (progress_percent = 50)
→ game_progress (progress_percent = 75)
→ game_completed
→ reveal_viewed
→ share_clicked
```

Chaque flèche affiche le taux de passage à l'étape suivante — c'est
directement le taux d'abandon à cet endroit précis du parcours.

Segments utiles à croiser avec cet entonnoir (onglet "Segments" de
l'exploration) :
- **par difficulté** (`difficulty`) : quel niveau perd le plus de joueurs
  entre `game_started` et `first_move` (grille jugée trop intimidante ?) ou
  entre 25 % et 50 % (trop dur au milieu de la grille ?).
- **par appareil** (`device_type`, présent sur `home_viewed`) : compare le
  taux `home_viewed → game_started` mobile vs desktop.
- **par langue** (`language`) : un taux d'abandon significativement plus
  élevé sur une langue peut indiquer un texte confus ou une traduction
  manquante à cet endroit précis du parcours.

Autres lectures utiles (rapports standards ou explorations libres) :
- **Temps médian de résolution** : rapport "Exploration libre", dimension
  `difficulty`, métrique médiane sur le paramètre `completion_time_seconds`
  de `game_completed`.
- **Erreurs par appareil** : exploration sur l'événement `app_error`,
  ventilée par `device_type` (récupéré via un événement `home_viewed`
  associé à la même session) et par `error_code`.
- **Taux d'abandon par difficulté** : rapport comparant le nombre
  d'événements `game_started` et `game_abandoned` par valeur de
  `difficulty`.

## 6. Limites connues de la détection d'abandon

Documentées aussi en commentaire dans `src/lib/tracking/session.js` :

- Une partie fermée brutalement (onglet fermé, app tuée en arrière-plan
  sur mobile, coupure réseau/batterie) n'est détectée comme abandon qu'**au
  prochain chargement de l'app**, pas en temps réel — c'est la limite
  technique fondamentale de toute mesure d'abandon côté client sans envoi
  réseau fiable au moment de la fermeture (`beforeunload` n'est pas fiable
  pour un envoi réseau garanti, en particulier sur mobile).
- Si le joueur vide son `localStorage` entre les deux, ce signal est perdu
  (mais aucun double comptage n'en résulte : l'événement est simplement
  absent).
- Sur un appareil partagé, une partie inachevée par une personne peut être
  comptée comme abandon au chargement suivant même si c'est quelqu'un
  d'autre qui rouvre l'app.
- Le pourcentage de progression utilisé pour tous les événements
  (`progress_percent`) correspond au **pourcentage de l'image révélée**
  (`revealProgress` dans `useGame.js`), pas au pourcentage de cases
  remplies — c'est la métrique la plus fidèle au principe du jeu (l'objectif
  perçu par le joueur est de révéler l'image, pas juste remplir des
  chiffres), mais à garder en tête si tu compares avec d'autres mesures de
  "progression" internes.

## 7. Consentement et confidentialité — points à valider juridiquement

Ce projet met en place un consentement à trois catégories (nécessaire /
mesure d'audience / publicité), avec refus possible sans blocage du jeu, et
aucune collecte de contenu personnel (voir `src/lib/tracking/index.js` :
tout événement lié à une partie avec photo personnelle
(`content_type = personal_image`) omet systématiquement `puzzle_id`).

Cela dit, cette implémentation **ne constitue pas un avis juridique**. Avant
un lancement public, fais valider par un professionnel (selon les pays
ciblés) :
- si le bandeau de consentement actuel (refus en un clic, "Personnaliser"
  pour le détail) satisfait les exigences locales (CNIL/RGPD en France et
  UE, mais d'autres régimes existent selon les pays visés) ;
- si Google Analytics 4 et Microsoft Clarity nécessitent un accord de
  sous-traitance (DPA) signé avec Google/Microsoft pour ton usage
  spécifique ;
- si la durée de conservation par défaut de GA4 (configurable dans
  Admin → Paramètres des données → Conservation) doit être réduite ;
  Clarity conserve ses enregistrements par défaut ~1 an, également
  configurable dans les paramètres du projet ;
- si la page de confidentialité (section CGU/Politique dans
  `src/components/LegalModal.jsx`) doit être enrichie d'une base légale
  précise par catégorie de traitement.
