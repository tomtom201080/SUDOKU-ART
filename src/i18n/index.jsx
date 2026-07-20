import { useContext, useState } from 'react';
import LangContext from './context.js';

const LANG_KEY = 'sudoku-devoile:lang';

const FR = {
  // ── Difficultés ──────────────────────────────────────────────
  diff_facile: 'Facile',
  diff_moyen: 'Moyen',
  diff_complique: 'Compliqué',
  diff_enfer: 'Enfer',

  // ── Accueil ──────────────────────────────────────────────────
  home_title: 'Sudoku Art',
  home_subtitle: 'Résous la grille, révèle une œuvre d\'art',
  home_art_label: 'Art',
  home_art_desc: 'Découvre une grande œuvre cachée derrière ta grille',
  home_sudoku_label: 'Sudoku',
  home_sudoku_desc: 'Le sudoku classique, sans image, pour se concentrer',
  home_memories_label: 'Memories',
  home_memories_desc: 'Envoie une photo à un ami, il la dévoile en jouant',
  home_defi_label: 'Défi',
  home_defi_desc: 'Défie un ami sur la même grille et compare vos scores',
  home_back: '← Retour',
  home_choose_diff: 'Choisis la difficulté',
  home_classic_title: 'Sudoku classique',
  home_choose_photo: 'Choisis une photo',
  home_photo_hint: 'Elle se révèlera au fur et à mesure que tu remplis la grille.',
  home_photo_pick: '📷 Choisir depuis ma galerie',
  home_photo_change: 'Changer de photo',
  home_photo_remove: '✕ Retirer la photo',
  home_what_todo: 'Que veux-tu faire ?',
  home_play_solo: 'Jouer seul',
  home_play_solo_desc: 'Découvre ta photo en jouant pour toi',
  home_send_friend: 'Envoyer à un ami',
  home_send_friend_desc: 'Crée un défi avec ta photo et partage le lien WhatsApp',

  // ── En jeu ───────────────────────────────────────────────────
  game_intensity: '🖼 Intensité du filigrane',
  game_erase: '✕ Effacer',
  game_notes: '✏️ Notes',
  game_undo: '↩️ Annuler',
  game_hint: '💡 Indice',

  // ── Victoire ──────────────────────────────────────────────────
  win_title: 'Grille terminée ! 🎉',
  win_difficulty: 'Difficulté : ',
  win_photo_revealed: 'Ta photo, entièrement dévoilée !',
  win_challenge_note: 'Cette photo et ce défi vont maintenant être supprimés de nos serveurs.',
  win_save_photo: '💾 Enregistrer la photo',
  win_share: '📤 Partager',
  win_send_result: '📤 Envoyer mon résultat à ',
  win_challenge_friend: '🎯 Défier un ami avec cette grille',
  win_play_again: '🔄 Nouvelle partie',
  win_close: 'Fermer',
  win_rematch_title_win: '🏆 Tu as gagné ce défi !',
  win_rematch_title_lose: '😅 Ton ami a fait mieux cette fois.',
  win_rematch_title_tie: '🤝 Égalité parfaite !',
  win_rematch_send: '📤 Envoyer le résultat par WhatsApp',
  win_rematch_sent: '✅ Résultat envoyé',
  win_me: 'Toi',
  win_errors: 'Erreurs',
  win_time: 'Temps',

  // ── Échec ──────────────────────────────────────────────────────
  fail_title: 'Partie perdue 😞',
  fail_try_again: 'Réessayer',

  // ── Indice ────────────────────────────────────────────────────
  hint_ad_label: '📢 Publicité',
  hint_wait: 'L\'indice sera disponible dans {n} seconde{s}…',
  hint_counter: 'Indice {n}',
  hint_counter_max: 'Indice {n} / {max}',
  hint_revealed: 'La case surlignée en vert contient le chiffre {v}.',
  hint_place: 'Placer le {v}',
  hint_none: 'Aucun indice disponible.',
  hint_close: 'Fermer',

  // ── Onboarding ────────────────────────────────────────────────
  onboarding_skip: 'Passer',
  onboarding_next: 'Suivant →',
  onboarding_start: 'C\'est parti ! 🚀',
  onboarding_s1_title: 'Un Sudoku pas comme les autres',
  onboarding_s1_text: 'Remplis la grille avec les chiffres de 1 à 9 : chaque ligne, colonne et carré de 3×3 doit contenir chaque chiffre une seule fois.',
  onboarding_s2_title: 'Une photo cachée derrière',
  onboarding_s2_text: 'Une œuvre d\'art (ou ta propre photo) se cache derrière la grille, et se révèle case par case au fil de tes bonnes réponses.',
  onboarding_s3_title: 'Complète une ligne, admire l\'image',
  onboarding_s3_text: 'Quand tu complètes une ligne, une colonne ou un carré, la grille s\'efface 2 secondes pour te laisser contempler la portion révélée.',
  onboarding_s4_title: 'Défie tes amis !',
  onboarding_s4_text: 'Termine une grille, puis envoie exactement la même à un ami via WhatsApp. Comparez vos scores et découvrez qui est le meilleur !',

  // ── Aide ──────────────────────────────────────────────────────
  help_title: '❓ Règles & comment jouer',
  help_close: 'Fermer',
  help_go: 'Compris, je me lance !',

  // ── Auth ──────────────────────────────────────────────────────
  auth_signin: 'Se connecter',
  auth_signup: 'Créer un compte',
  auth_free_play: '🎮 Jouer en partie libre (sans compte)',
  auth_email: 'Email',
  auth_password: 'Mot de passe',
  auth_forgot: 'Mot de passe oublié ?',
  auth_submit_signin: 'Se connecter',
  auth_submit_signup: 'Créer mon compte',
  auth_share: '📤 Partager l\'appli avec un ami',

  // ── Défi composer ─────────────────────────────────────────────
  defi_title: '🎯 Créer un défi',
  defi_step1: '1. Choisis la difficulté',
  defi_step2: '2. Ajouter une photo (optionnel)',
  defi_step3: '3. Ton prénom (pour le résultat)',
  defi_prenom_placeholder: 'Ex : Thomas',
  defi_pick_photo: '📷 Choisir une photo',
  defi_change: 'Changer',
  defi_remove: 'Retirer',
  defi_send: '📤 Envoyer et jouer',
  defi_sending: 'Envoi en cours…',
  defi_no_account: '💡 Sans compte, tu ne sauras pas si ton ami a joué ni qui a gagné. Le défi fonctionnera quand même pour lui.',
  defi_error: 'L\'envoi a échoué. Réessaie dans un instant.',
  defi_done: '✅ Défi envoyé ! La grille se lance…',

  // ── Défi dashboard ────────────────────────────────────────────
  defi_dash_title: '🎯 Mes défis',
  defi_dash_create: '➕ Créer un nouveau défi',
  defi_tab_sent: 'Envoyés',
  defi_tab_received: 'Reçus',
  defi_empty_sent: 'Tu n\'as pas encore envoyé de défi.',
  defi_empty_received: 'Tu n\'as pas encore reçu de défi.',
  defi_waiting: 'Pas encore joué',
  defi_badge_win: 'Gagné 🏆',
  defi_badge_lose: 'Perdu',
  defi_badge_tie: 'Égalité',
  defi_badge_pending: 'En attente',
  defi_friend: 'Ami',
  defi_connected_friend: 'Ami connecté',
  defi_score_me: 'Moi : ',
  defi_loading: 'Chargement…',

  // ── Galerie ───────────────────────────────────────────────────
  gallery_title: 'Galerie',
  gallery_empty: 'Termine un sudoku pour débloquer ta première image !',
  gallery_all: 'Tout',

  // ── Quitter ───────────────────────────────────────────────────
  quit_title: 'Quitter la partie ?',
  quit_desc: 'Ta progression sera perdue. Connecte-toi pour la sauvegarder et retrouver ta galerie sur tous tes appareils.',
  quit_continue: '▶ Continuer à jouer',
  quit_login: '👤 Se connecter / S\'inscrire',
  quit_anyway: 'Quitter sans sauvegarder',

  // ── Suppression compte ────────────────────────────────────────
  delete_title: 'Supprimer mon compte',
  delete_warning: 'Cette action est irréversible. Seront supprimés définitivement :',
  delete_item1: 'Ton adresse email et tes identifiants',
  delete_item2: 'Ta galerie de tableaux débloqués',
  delete_item3: 'Ta progression (vues, statistiques)',
  delete_item4: 'Tous les défis que tu as envoyés ou reçus',
  delete_note: 'Les photos uploadées dans les défis sont déjà supprimées automatiquement après 7 jours.',
  delete_cancel: 'Annuler',
  delete_confirm1: 'Supprimer quand même',
  delete_last: 'Dernière confirmation : tu vas supprimer définitivement ton compte Sudoku Art.',
  delete_confirm2: 'Oui, supprimer mon compte',
  delete_deleting: 'Suppression…',
  delete_error: 'Une erreur s\'est produite. Réessaie dans un instant.',

  // ── Légal ──────────────────────────────────────────────────────
  legal_terms_title: 'Conditions Générales d\'Utilisation',
  legal_privacy_title: 'Politique de confidentialité',
  legal_close: 'J\'ai compris',
  legal_close_plain: 'Fermer sans changer',
  legal_consent_reject: 'Refuser les pubs personnalisées',
  legal_consent_accept: 'Accepter',
  footer_cgu: 'CGU',
  footer_privacy: 'Confidentialité',
  footer_delete: 'Supprimer mon compte',

  // ── Peinture ──────────────────────────────────────────────────
  painting_observe: '👀 À observer : ',

  // ── Install ────────────────────────────────────────────────────
  install_title: '📲 Installer l\'app',

  // ── Rematch composer ──────────────────────────────────────────
  rematch_title: '🎯 Défier un ami avec cette grille',
  rematch_desc: 'Ton ami jouera exactement la même grille que toi.',
  rematch_photo_title: 'Ajouter une photo perso à découvrir (optionnel)',
  rematch_prenom_title: 'Ton prénom (optionnel)',
  rematch_pick_photo: '📷 Choisir une photo',
  rematch_change: 'Changer de photo',
  rematch_send: 'Envoyer le défi',
  rematch_sending: 'Envoi en cours…',
  rematch_success: 'Défi envoyé ! On te dira qui a gagné dès que ton ami aura fini.',
  rematch_close: 'Fermer',
  rematch_error: 'L\'envoi a échoué, réessaie dans un instant.',
  rematch_no_account: '💡 Sans compte, tu ne sauras pas si ton ami a joué ni qui a gagné.',

  // ── App général ────────────────────────────────────────────────
  app_loading: 'Chargement…',
  app_dark: 'Mode sombre',
  app_light: 'Mode clair',
  app_my_profile: 'Mon profil',

  // ── Consent / Pub ─────────────────────────────────────────────
  ad_label: 'Publicité',
  ad_wait: 'Vous pourrez continuer dans {n} seconde{s}…',
  ad_continue: 'Continuer →',

  // ── Auth ──────────────────────────────────────────────────────
  auth_forgot_title: 'Mot de passe oublié',
  auth_create_btn: 'Créer mon compte',
  auth_send_link: 'Envoyer le lien',
  auth_signin_btn: 'Se connecter',

  // ── ChallengeComposer ─────────────────────────────────────────
  cc_unlimited: 'Illimité',
  cc_send_btn: 'Créer et envoyer le défi',
  cc_close: 'Fermer',
  cc_photo_warning: '⚠️ Ce lien donne accès à la photo : ne le transfère qu\'à la personne à qui c\'est destiné !\n(Elle sera supprimée dans {days} jours.)',
  cc_share_title: 'Défi Sudoku Art',

  // ── ChallengeFailModal ────────────────────────────────────────
  fail_share_title: 'Résultat du défi Sudoku Art',
  fail_new_game: 'Nouvelle partie',
  fail_close: 'Fermer',

  // ── DefiComposer ──────────────────────────────────────────────
  defi_mode_perso_label: 'Perso',
  defi_mode_perso_desc: '1 seul joueur peut ouvrir le lien',
  defi_mode_group_label: 'Groupe',
  defi_mode_group_desc: 'Plusieurs joueurs peuvent jouer',
  defi_photo_change: 'Changer',
  defi_photo_remove: 'Retirer',
  defi_a_friend: 'Un ami',

  // ── DefiDashboard ─────────────────────────────────────────────
  dd_no_results: 'Personne n\'a encore joué.',
  dd_sent_label: 'Défi envoyé',
  dd_sent_by: 'Envoyé par {name}',
  dd_results_arrow: 'Voir résultats →',
  dd_group_badge: 'Groupe',
  dd_won: 'Gagné 🏆',
  dd_tie: 'Égalité 🤝',
  dd_lost: 'Perdu',

  // ── DeleteAccountModal ────────────────────────────────────────
  del_title: 'Supprimer mon compte',
  del_warning: 'Cette action est irréversible. Seront supprimés définitivement :',
  del_item1: 'Ton adresse email et tes identifiants',
  del_item2: 'Ta galerie de tableaux débloqués',
  del_item3: 'Ta progression (vues, statistiques)',
  del_item4: 'Tous les défis que tu as envoyés ou reçus',
  del_note: 'Les photos uploadées dans les défis sont déjà supprimées automatiquement après 7 jours.',
  del_cancel: 'Annuler',
  del_confirm1: 'Supprimer quand même',
  del_confirm2: 'Oui, supprimer mon compte',
  del_final: 'Dernière confirmation : tu vas supprimer définitivement ton compte Sudoku Art.',
  del_deleting: 'Suppression…',
  del_error: 'Une erreur s\'est produite. Réessaie dans un instant.',

  // ── HelpModal ─────────────────────────────────────────────────
  help_rule1: 'Chaque ligne doit contenir les chiffres 1 à 9, sans répétition',
  help_rule2: 'Chaque colonne doit contenir les chiffres 1 à 9, sans répétition',
  help_rule3: 'Chaque carré de 3×3 doit contenir les chiffres 1 à 9, sans répétition',

  // ── InstallAppModal ───────────────────────────────────────────
  install_ios1: 'Appuie sur le bouton Partager ⬆️ en bas de l\'écran (Safari)',
  install_ios2: 'Fais défiler et choisis "Sur l\'écran d\'accueil"',
  install_ios3: 'Appuie sur "Ajouter" en haut à droite',
  install_android1: 'Appuie sur le menu ⋮ (3 points) en haut à droite de Chrome',
  install_android2: 'Choisis "Installer l\'application" ou "Ajouter à l\'écran d\'accueil"',
  install_android3: 'Confirme l\'ajout',

  // ── IncomingDefiModal ─────────────────────────────────────────
  incoming_challenges_you: '{name} te défie !',
  incoming_a_friend: 'Un ami',
  incoming_group: 'Groupe',
  incoming_connected: 'Connexion pour rattacher à ton compte',
  incoming_pseudo_title: 'Choisis un pseudo pour ce défi',
  incoming_pseudo_desc: 'Il sera visible dans le classement.',
  incoming_pseudo_placeholder: 'Ton pseudo (ex : Joueur42)',
  incoming_pseudo_btn: '▶ Jouer avec ce pseudo',
  incoming_pseudo_checking: 'Vérification…',
  incoming_pseudo_back: '← Retour',
  incoming_pseudo_short: 'Au moins 2 caractères.',
  incoming_pseudo_long: '20 caractères maximum.',
  incoming_pseudo_taken: 'Ce pseudo est déjà pris dans ce défi. Choisis-en un autre.',
  incoming_pseudo_error: 'Erreur de vérification. Réessaie.',

  // ── MaxErrorsModal ────────────────────────────────────────────
  maxerr_title: '{n} erreurs !',
  maxerr_ad_title: 'Publicité en cours…',
  maxerr_desc: 'Tu as atteint la limite. Regarde une pub pour gagner une chance supplémentaire, ou termine la partie.',
  maxerr_watch_ad: '📺 Regarder une pub pour +1 chance',
  maxerr_continue: '▶ Continuer quand même',
  maxerr_quit: 'Terminer la partie',
  maxerr_granted: '+1 chance accordée !',
  maxerr_granted_desc: 'Le compteur revient à {n} / {max}.',
  maxerr_continue_btn: '▶ Continuer la partie',

  // ── RematchComposer ───────────────────────────────────────────
  rc_share_title: 'Défi Sudoku Art',
  rc_close: 'Fermer',

  // ── RematchResultDetail ───────────────────────────────────────
  rrd_errors: 'Erreurs',
  rrd_time: 'Temps',
  rrd_me: 'Toi',
  rrd_friend: 'Ton ami',

  // ── UpdatePasswordScreen ──────────────────────────────────────
  upd_title: 'Nouveau mot de passe',
  upd_btn: 'Mettre à jour le mot de passe',
  upd_loading: 'Un instant…',

  // ── UsernameModal ─────────────────────────────────────────────
  uname_title: 'Choisis ton pseudo',
  uname_desc: 'Il sera visible par les autres joueurs quand tu envoies un défi. Tu peux le changer plus tard.',
  uname_rules: '3 à 20 caractères · lettres, chiffres, _ et -',
  uname_placeholder: 'ex : SuperJoueur42',
  uname_btn: 'Valider mon pseudo',
  uname_saving: 'Enregistrement…',
  uname_done: '✅ Pseudo enregistré !',
  uname_checking: 'Vérification…',
  uname_short: 'Au moins 3 caractères.',
  uname_long: '20 caractères maximum.',
  uname_invalid: 'Lettres, chiffres, _ et - uniquement.',
  uname_taken: 'Ce pseudo est déjà pris. Essaie avec un autre.',
  uname_error: 'Une erreur s\'est produite. Réessaie.',

  // ── WinModal ──────────────────────────────────────────────────
  win_new_game: 'Nouvelle partie',
  win_save_title: 'Enregistrer la photo',
  win_save_now: 'Enregistrer maintenant',
  win_cancel: 'Annuler',
  win_a_friend: 'Ton ami',
  win_score: '⏱ {time} — ❌ {errors} erreur{s}',

  // ── Scoring ───────────────────────────────────────────────────
  scoring_rule: 'Score = temps réel +2 min par erreur ou indice. Le plus bas gagne.',
  scoring_note: '+2 min par erreur · +2 min par indice',
  // ── AdConsentBanner ───────────────────────────────────────────
  consent_text: 'Sudoku Art est gratuite grâce à des publicités. Acceptes-tu qu\'elles soient personnalisées selon tes intérêts ?',
  consent_accept: 'Accepter',
  consent_reject: 'Refuser',

  // ── AdSlot ────────────────────────────────────────────────────
  ad_placeholder: '📢 Emplacement publicitaire — sera actif une fois ton compte AdSense configuré',

  // ── AuthScreen ────────────────────────────────────────────────
  auth_error: 'Une erreur est survenue.',
  auth_switch_signin: 'Déjà un compte ? Se connecter',
  auth_switch_signup: 'Créer un compte',
  auth_switch_forgot: 'Mot de passe oublié ?',
  auth_switch_back: '← Retour à la connexion',

  // ── ChallengeComposer ─────────────────────────────────────────
  cc_title: '🎯 Envoyer une grille personnalisée',
  cc_step3: '3. Nombre d\'erreurs autorisées',
  cc_photo_disclaimer: '⚠️ Ce lien donne accès à la photo : ne le transfère qu\'à la personne à qui c\'est destiné !\n(Elle sera supprimée dans {days} jours.)',

  // ── ChallengeFailModal ────────────────────────────────────────
  fail_too_many: 'Trop d\'erreurs ou temps écoulé — la photo ne sera pas dévoilée cette fois.',
  fail_result_sent: '✅ Résultat envoyé',
  fail_send_result: '📤 Envoyer mon résultat à {email}',
  fail_stats: '{errors} erreur{s} — ⏱ {time}',

  // ── DefiComposer ──────────────────────────────────────────────
  defi_step1_label: '1. Mode du défi',
  defi_rule_msg: '\n⏱ Règle : +2 min par erreur ou indice utilisé',
  defi_group_msg: '\nPlusieurs personnes peuvent jouer — partagez le lien !',
  defi_photo_personal_warning: '⚠️ Ce lien est réservé à une seule personne — ne le transfère pas.',

  // ── DefiDashboard ─────────────────────────────────────────────
  dd_sender_label: 'Toi (expéditeur)',
  dd_scoring: '⏱ +2 min par erreur · 💡 +2 min par indice',
  dd_delete_title: 'Supprimer',

  // ── HelpModal ─────────────────────────────────────────────────
  help_rules_title: '❓ Règles & comment jouer',
  help_center_cell: 'La case tout au centre est visible dès le départ',
  help_correct_cell: 'Une case que tu remplis correctement se révèle immédiatement',
  help_given_cell: 'Une case déjà donnée au départ ne se révèle que lorsqu\'une ligne, colonne ou carré est complet',
  help_undo: '↩️ Annuler : revient au coup précédent',
  help_hint_desc: '💡 Indice : propose de révéler un chiffre dans la grille',
  help_diff_title: '🎯 Difficulté & rareté',
  help_diff_desc: 'Plus la difficulté est élevée, moins il y a de chiffres donnés au départ. Chaque niveau débloque des tableaux de rareté différente.',
  help_challenge_desc: 'Tu peux configurer un nombre d\'erreurs autorisées et un temps limite.',

  // ── HintModal ─────────────────────────────────────────────────
  hint_question: 'Quel chiffre veux-tu découvrir ?',

  // ── HomeProgress ──────────────────────────────────────────────
  progress_games_won: 'Parties\ngagnées',
  progress_days_streak: 'Jours\nde suite',
  progress_unlocked: 'Tableaux\ndébloqués',

  // ── IncomingDefiModal ─────────────────────────────────────────
  incoming_rule_short: '⏱ +2 min/erreur ou indice',

  // ── KpiDashboard ──────────────────────────────────────────────
  kpi_loading: 'Chargement…',
  kpi_started_today: 'Parties commencées aujourd\'hui',
  kpi_finished_today: 'Parties terminées aujourd\'hui',
  kpi_total_started: 'Total commencées',
  kpi_total_finished: 'Total terminées',
  kpi_completion: 'Taux de complétion',
  kpi_failed: 'Défis échoués',
  kpi_with_photo: 'Parties avec photo perso',
  kpi_challenges: 'Défis joués',
  kpi_by_diff: 'Par difficulté',
  kpi_diff_col: 'Difficulté',
  kpi_started_col: 'Commencées',
  kpi_finished_col: 'Terminées',
  kpi_rate_col: 'Taux',
  kpi_day_col: 'Jour',

  // ── MaxErrorsModal ────────────────────────────────────────────
  maxerr_watch_ad_full: '📺 Regarder une pub pour +1 chance',
  maxerr_quit_full: 'Terminer la partie',

  // ── RematchComposer ───────────────────────────────────────────
  rc_result_msg: 'Mon résultat : {errors} erreur{s}, {min}m {sec}s. À toi de faire mieux !\n{link}',
  rc_photo_warning: '⚠️ Ce lien donne accès à une photo : ne le transfère qu\'à la bonne personne (supprimée dans {days} jours).',
  rc_close_btn: 'Fermer',
  rc_desc: 'Ton ami jouera exactement la même grille que toi, et on comparera vos résultats une fois qu\'il aura terminé.',

  // ── RematchResultDetail ───────────────────────────────────────
  rrd_friend_better: '😅 Ton ami a fait mieux que toi cette fois.',

  // ── WinModal ─────────────────────────────────────────────────
  win_difficulty_label: 'Difficulté : ',
  win_no_error: 'aucune erreur 🏆',
  win_share_text: '{painting}Difficulté : {diff} — {time} — {errors}\nJoue aussi : https://sudoku-art.vercel.app',
  win_result_msg: 'Difficulté : {diff} — Erreurs : {errors} — Temps : {time}',
  win_stats_row: '❌ {errors} erreur{s} — ⏱ {time}',
  win_table_raw: '⏱ Brut',
  win_table_score: '🏁 Score',

};

const EN = {
  // ── Difficulties ─────────────────────────────────────────────
  diff_facile: 'Easy',
  diff_moyen: 'Medium',
  diff_complique: 'Hard',
  diff_enfer: 'Hell',

  // ── Home ──────────────────────────────────────────────────────
  home_title: 'Sudoku Art',
  home_subtitle: 'Solve the grid, reveal a work of art',
  home_art_label: 'Art',
  home_art_desc: 'Discover a famous artwork hidden behind your grid',
  home_sudoku_label: 'Sudoku',
  home_sudoku_desc: 'Classic sudoku, no image, pure focus',
  home_memories_label: 'Memories',
  home_memories_desc: 'Send a photo to a friend — they reveal it while playing',
  home_defi_label: 'Challenge',
  home_defi_desc: 'Challenge a friend on the same grid and compare scores',
  home_back: '← Back',
  home_choose_diff: 'Choose difficulty',
  home_classic_title: 'Classic Sudoku',
  home_choose_photo: 'Choose a photo',
  home_photo_hint: 'It will reveal itself as you fill in the grid.',
  home_photo_pick: '📷 Choose from my gallery',
  home_photo_change: 'Change photo',
  home_photo_remove: '✕ Remove photo',
  home_what_todo: 'What do you want to do?',
  home_play_solo: 'Play solo',
  home_play_solo_desc: 'Reveal your photo by playing for yourself',
  home_send_friend: 'Send to a friend',
  home_send_friend_desc: 'Create a challenge with your photo and share the WhatsApp link',

  // ── In game ───────────────────────────────────────────────────
  game_intensity: '🖼 Watermark intensity',
  game_erase: '✕ Erase',
  game_notes: '✏️ Notes',
  game_undo: '↩️ Undo',
  game_hint: '💡 Hint',

  // ── Win ───────────────────────────────────────────────────────
  win_title: 'Grid complete! 🎉',
  win_difficulty: 'Difficulty: ',
  win_photo_revealed: 'Your photo, fully revealed!',
  win_challenge_note: 'This photo and challenge will now be deleted from our servers.',
  win_save_photo: '💾 Save photo',
  win_share: '📤 Share',
  win_send_result: '📤 Send my result to ',
  win_challenge_friend: '🎯 Challenge a friend with this grid',
  win_play_again: '🔄 New game',
  win_close: 'Close',
  win_rematch_title_win: '🏆 You won this challenge!',
  win_rematch_title_lose: '😅 Your friend did better this time.',
  win_rematch_title_tie: '🤝 Perfect tie!',
  win_rematch_send: '📤 Send result via WhatsApp',
  win_rematch_sent: '✅ Result sent',
  win_me: 'You',
  win_errors: 'Errors',
  win_time: 'Time',

  // ── Fail ──────────────────────────────────────────────────────
  fail_title: 'Game over 😞',
  fail_try_again: 'Try again',

  // ── Hint ──────────────────────────────────────────────────────
  hint_ad_label: '📢 Ad',
  hint_wait: 'Hint available in {n} second{s}…',
  hint_counter: 'Hint {n}',
  hint_counter_max: 'Hint {n} / {max}',
  hint_revealed: 'The highlighted green cell contains the number {v}.',
  hint_place: 'Place {v}',
  hint_none: 'No hint available.',
  hint_close: 'Close',

  // ── Onboarding ────────────────────────────────────────────────
  onboarding_skip: 'Skip',
  onboarding_next: 'Next →',
  onboarding_start: 'Let\'s go! 🚀',
  onboarding_s1_title: 'A Sudoku like no other',
  onboarding_s1_text: 'Fill the grid with numbers 1 to 9: each row, column and 3×3 square must contain each number exactly once.',
  onboarding_s2_title: 'A hidden photo behind',
  onboarding_s2_text: 'A work of art (or your own photo) hides behind the grid and reveals itself cell by cell as you fill in correct answers.',
  onboarding_s3_title: 'Complete a row, admire the image',
  onboarding_s3_text: 'When you complete a row, column or square, the grid clears for 2 seconds so you can admire the revealed portion.',
  onboarding_s4_title: 'Challenge your friends!',
  onboarding_s4_text: 'Finish a grid, then send the exact same one to a friend via WhatsApp. Compare scores and see who wins!',

  // ── Help ──────────────────────────────────────────────────────
  help_title: '❓ Rules & how to play',
  help_close: 'Close',
  help_go: 'Got it, let\'s play!',

  // ── Auth ──────────────────────────────────────────────────────
  auth_signin: 'Sign in',
  auth_signup: 'Create account',
  auth_free_play: '🎮 Play without an account',
  auth_email: 'Email',
  auth_password: 'Password',
  auth_forgot: 'Forgot password?',
  auth_submit_signin: 'Sign in',
  auth_submit_signup: 'Create my account',
  auth_share: '📤 Share the app with a friend',

  // ── Challenge composer ────────────────────────────────────────
  defi_title: '🎯 Create a challenge',
  defi_step1: '1. Choose difficulty',
  defi_step2: '2. Add a photo (optional)',
  defi_step3: '3. Your name (for the result)',
  defi_prenom_placeholder: 'E.g.: Thomas',
  defi_pick_photo: '📷 Choose a photo',
  defi_change: 'Change',
  defi_remove: 'Remove',
  defi_send: '📤 Send and play',
  defi_sending: 'Sending…',
  defi_no_account: '💡 Without an account, you won\'t know if your friend played or who won. The challenge will still work for them.',
  defi_error: 'Send failed. Try again in a moment.',
  defi_done: '✅ Challenge sent! Loading grid…',

  // ── Challenge dashboard ───────────────────────────────────────
  defi_dash_title: '🎯 My challenges',
  defi_dash_create: '➕ Create a new challenge',
  defi_tab_sent: 'Sent',
  defi_tab_received: 'Received',
  defi_empty_sent: 'You haven\'t sent any challenges yet.',
  defi_empty_received: 'You haven\'t received any challenges yet.',
  defi_waiting: 'Not played yet',
  defi_badge_win: 'Won 🏆',
  defi_badge_lose: 'Lost',
  defi_badge_tie: 'Tie',
  defi_badge_pending: 'Pending',
  defi_friend: 'Friend',
  defi_connected_friend: 'Connected friend',
  defi_score_me: 'Me: ',
  defi_loading: 'Loading…',

  // ── Gallery ───────────────────────────────────────────────────
  gallery_title: 'Gallery',
  gallery_empty: 'Finish a sudoku to unlock your first image!',
  gallery_all: 'All',

  // ── Quit ──────────────────────────────────────────────────────
  quit_title: 'Quit game?',
  quit_desc: 'Your progress will be lost. Sign in to save it and find your gallery on all your devices.',
  quit_continue: '▶ Keep playing',
  quit_login: '👤 Sign in / Create account',
  quit_anyway: 'Quit without saving',

  // ── Delete account ────────────────────────────────────────────
  delete_title: 'Delete my account',
  delete_warning: 'This action is irreversible. The following will be permanently deleted:',
  delete_item1: 'Your email address and credentials',
  delete_item2: 'Your unlocked artwork gallery',
  delete_item3: 'Your progress (views, stats)',
  delete_item4: 'All challenges you sent or received',
  delete_note: 'Photos uploaded in challenges are already automatically deleted after 7 days.',
  delete_cancel: 'Cancel',
  delete_confirm1: 'Delete anyway',
  delete_last: 'Final confirmation: you are about to permanently delete your Sudoku Art account.',
  delete_confirm2: 'Yes, delete my account',
  delete_deleting: 'Deleting…',
  delete_error: 'An error occurred. Please try again.',

  // ── Legal ─────────────────────────────────────────────────────
  legal_terms_title: 'Terms of Service',
  legal_privacy_title: 'Privacy Policy',
  legal_close: 'Got it',
  legal_close_plain: 'Close without changing',
  legal_consent_reject: 'Reject personalised ads',
  legal_consent_accept: 'Accept',
  footer_cgu: 'Terms',
  footer_privacy: 'Privacy',
  footer_delete: 'Delete my account',

  // ── Painting ──────────────────────────────────────────────────
  painting_observe: '👀 Look for: ',

  // ── Install ────────────────────────────────────────────────────
  install_title: '📲 Install app',

  // ── Rematch composer ──────────────────────────────────────────
  rematch_title: '🎯 Challenge a friend with this grid',
  rematch_desc: 'Your friend will play the exact same grid as you.',
  rematch_photo_title: 'Add a personal photo to reveal (optional)',
  rematch_prenom_title: 'Your name (optional)',
  rematch_pick_photo: '📷 Choose a photo',
  rematch_change: 'Change photo',
  rematch_send: 'Send challenge',
  rematch_sending: 'Sending…',
  rematch_success: 'Challenge sent! We\'ll let you know when your friend finishes.',
  rematch_close: 'Close',
  rematch_error: 'Send failed, try again.',
  rematch_no_account: '💡 Without an account, you won\'t know if your friend played or who won.',

  // ── App general ────────────────────────────────────────────────
  app_loading: 'Loading…',
  app_dark: 'Dark mode',
  app_light: 'Light mode',
  app_my_profile: 'My profile',

  // ── Consent / Ad ──────────────────────────────────────────────
  ad_label: 'Advertisement',
  ad_wait: 'You can continue in {n} second{s}…',
  ad_continue: 'Continue →',

  // ── Auth ──────────────────────────────────────────────────────
  auth_forgot_title: 'Forgot password',
  auth_create_btn: 'Create account',
  auth_send_link: 'Send link',
  auth_signin_btn: 'Sign in',

  // ── ChallengeComposer ─────────────────────────────────────────
  cc_unlimited: 'Unlimited',
  cc_send_btn: 'Create and send challenge',
  cc_close: 'Close',
  cc_photo_warning: '⚠️ This link gives access to your photo: only send it to the intended person!\n(It will be deleted in {days} days.)',
  cc_share_title: 'Sudoku Art Challenge',

  // ── ChallengeFailModal ────────────────────────────────────────
  fail_share_title: 'Sudoku Art Challenge Result',
  fail_new_game: 'New game',
  fail_close: 'Close',

  // ── DefiComposer ──────────────────────────────────────────────
  defi_mode_perso_label: 'Personal',
  defi_mode_perso_desc: 'Only 1 player can open the link',
  defi_mode_group_label: 'Group',
  defi_mode_group_desc: 'Multiple players can play',
  defi_photo_change: 'Change',
  defi_photo_remove: 'Remove',
  defi_a_friend: 'A friend',

  // ── DefiDashboard ─────────────────────────────────────────────
  dd_no_results: 'Nobody has played yet.',
  dd_sent_label: 'Challenge sent',
  dd_sent_by: 'Sent by {name}',
  dd_results_arrow: 'See results →',
  dd_group_badge: 'Group',
  dd_won: 'Won 🏆',
  dd_tie: 'Tie 🤝',
  dd_lost: 'Lost',

  // ── DeleteAccountModal ────────────────────────────────────────
  del_title: 'Delete my account',
  del_warning: 'This action is irreversible. The following will be permanently deleted:',
  del_item1: 'Your email address and credentials',
  del_item2: 'Your unlocked artwork gallery',
  del_item3: 'Your progress (views, stats)',
  del_item4: 'All challenges you sent or received',
  del_note: 'Photos uploaded in challenges are already automatically deleted after 7 days.',
  del_cancel: 'Cancel',
  del_confirm1: 'Delete anyway',
  del_confirm2: 'Yes, delete my account',
  del_final: 'Final confirmation: you are about to permanently delete your Sudoku Art account.',
  del_deleting: 'Deleting…',
  del_error: 'An error occurred. Please try again.',

  // ── HelpModal ─────────────────────────────────────────────────
  help_rule1: 'Each row must contain the digits 1–9, without repetition',
  help_rule2: 'Each column must contain the digits 1–9, without repetition',
  help_rule3: 'Each 3×3 square must contain the digits 1–9, without repetition',

  // ── InstallAppModal ───────────────────────────────────────────
  install_ios1: 'Tap the Share button ⬆️ at the bottom of the screen (Safari)',
  install_ios2: 'Scroll down and choose "Add to Home Screen"',
  install_ios3: 'Tap "Add" in the top right',
  install_android1: 'Tap the ⋮ menu (3 dots) in the top right of Chrome',
  install_android2: 'Choose "Install app" or "Add to home screen"',
  install_android3: 'Confirm the addition',

  // ── IncomingDefiModal ─────────────────────────────────────────
  incoming_challenges_you: '{name} challenges you!',
  incoming_a_friend: 'A friend',
  incoming_group: 'Group',
  incoming_connected: 'Sign in to link your score to your account',
  incoming_pseudo_title: 'Choose a name for this challenge',
  incoming_pseudo_desc: 'It will appear in the leaderboard.',
  incoming_pseudo_placeholder: 'Your name (e.g. Player42)',
  incoming_pseudo_btn: '▶ Play with this name',
  incoming_pseudo_checking: 'Checking…',
  incoming_pseudo_back: '← Back',
  incoming_pseudo_short: 'At least 2 characters.',
  incoming_pseudo_long: '20 characters maximum.',
  incoming_pseudo_taken: 'This name is already taken in this challenge. Try another.',
  incoming_pseudo_error: 'Verification failed. Try again.',

  // ── MaxErrorsModal ────────────────────────────────────────────
  maxerr_title: '{n} errors!',
  maxerr_ad_title: 'Ad playing…',
  maxerr_desc: 'You\'ve reached the limit. Watch an ad to get one more chance, or end the game.',
  maxerr_watch_ad: '📺 Watch an ad for +1 chance',
  maxerr_continue: '▶ Continue anyway',
  maxerr_quit: 'End the game',
  maxerr_granted: '+1 chance granted!',
  maxerr_granted_desc: 'Counter reset to {n} / {max}.',
  maxerr_continue_btn: '▶ Keep playing',

  // ── RematchComposer ───────────────────────────────────────────
  rc_share_title: 'Sudoku Art Challenge',
  rc_close: 'Close',

  // ── RematchResultDetail ───────────────────────────────────────
  rrd_errors: 'Errors',
  rrd_time: 'Time',
  rrd_me: 'You',
  rrd_friend: 'Your friend',

  // ── UpdatePasswordScreen ──────────────────────────────────────
  upd_title: 'New password',
  upd_btn: 'Update password',
  upd_loading: 'Just a moment…',

  // ── UsernameModal ─────────────────────────────────────────────
  uname_title: 'Choose your username',
  uname_desc: 'Other players will see it when you send a challenge. You can change it later.',
  uname_rules: '3 to 20 characters · letters, digits, _ and -',
  uname_placeholder: 'e.g. SuperPlayer42',
  uname_btn: 'Set username',
  uname_saving: 'Saving…',
  uname_done: '✅ Username saved!',
  uname_checking: 'Checking…',
  uname_short: 'At least 3 characters.',
  uname_long: '20 characters maximum.',
  uname_invalid: 'Letters, digits, _ and - only.',
  uname_taken: 'This username is already taken. Try another.',
  uname_error: 'An error occurred. Please try again.',

  // ── WinModal ──────────────────────────────────────────────────
  win_new_game: 'New game',
  win_save_title: 'Save photo',
  win_save_now: 'Save now',
  win_cancel: 'Cancel',
  win_a_friend: 'Your friend',
  win_score: '⏱ {time} — ❌ {errors} error{s}',

  // ── Scoring ───────────────────────────────────────────────────
  scoring_rule: 'Score = real time +2 min per error or hint. Lowest wins.',
  scoring_note: '+2 min per error · +2 min per hint',
  // ── AdConsentBanner ───────────────────────────────────────────
  consent_text: 'Sudoku Art is free thanks to ads. Do you accept personalised ads based on your interests?',
  consent_accept: 'Accept',
  consent_reject: 'Decline',

  // ── AdSlot ────────────────────────────────────────────────────
  ad_placeholder: '📢 Ad slot — will be active once your AdSense account is approved',

  // ── AuthScreen ────────────────────────────────────────────────
  auth_error: 'An error occurred.',
  auth_switch_signin: 'Already have an account? Sign in',
  auth_switch_signup: 'Create an account',
  auth_switch_forgot: 'Forgot password?',
  auth_switch_back: '← Back to sign in',

  // ── ChallengeComposer ─────────────────────────────────────────
  cc_title: '🎯 Send a custom grid',
  cc_step3: '3. Errors allowed',
  cc_photo_disclaimer: '⚠️ This link gives access to the photo: only send it to the intended person!\n(It will be deleted in {days} days.)',

  // ── ChallengeFailModal ────────────────────────────────────────
  fail_too_many: 'Too many errors or time\'s up — the photo won\'t be revealed this time.',
  fail_result_sent: '✅ Result sent',
  fail_send_result: '📤 Send my result to {email}',
  fail_stats: '{errors} error{s} — ⏱ {time}',

  // ── DefiComposer ──────────────────────────────────────────────
  defi_step1_label: '1. Challenge mode',
  defi_rule_msg: '\n⏱ Rule: +2 min per error or hint used',
  defi_group_msg: '\nMultiple people can play — share the link!',
  defi_photo_personal_warning: '⚠️ This link is for one person only — don\'t forward it.',

  // ── DefiDashboard ─────────────────────────────────────────────
  dd_sender_label: 'You (sender)',
  dd_scoring: '⏱ +2 min per error · 💡 +2 min per hint',
  dd_delete_title: 'Delete',

  // ── HelpModal ─────────────────────────────────────────────────
  help_rules_title: '❓ Rules & how to play',
  help_center_cell: 'The centre cell is revealed from the start',
  help_correct_cell: 'A cell you fill in correctly is revealed immediately',
  help_given_cell: 'A pre-filled cell is only revealed when a row, column or square is completed',
  help_undo: '↩️ Undo: go back one move',
  help_hint_desc: '💡 Hint: reveals a digit in the grid',
  help_diff_title: '🎯 Difficulty & rarity',
  help_diff_desc: 'Higher difficulty means fewer starting digits. Each level unlocks artwork of different rarity.',
  help_challenge_desc: 'You can set a maximum number of errors and a time limit.',

  // ── HintModal ─────────────────────────────────────────────────
  hint_question: 'Which digit do you want to reveal?',

  // ── HomeProgress ──────────────────────────────────────────────
  progress_games_won: 'Games\nwon',
  progress_days_streak: 'Day\nstreak',
  progress_unlocked: 'Artworks\nunlocked',

  // ── IncomingDefiModal ─────────────────────────────────────────
  incoming_rule_short: '⏱ +2 min/error or hint',

  // ── KpiDashboard ──────────────────────────────────────────────
  kpi_loading: 'Loading…',
  kpi_started_today: 'Games started today',
  kpi_finished_today: 'Games finished today',
  kpi_total_started: 'Total started',
  kpi_total_finished: 'Total finished',
  kpi_completion: 'Completion rate',
  kpi_failed: 'Failed challenges',
  kpi_with_photo: 'Games with custom photo',
  kpi_challenges: 'Challenges played',
  kpi_by_diff: 'By difficulty',
  kpi_diff_col: 'Difficulty',
  kpi_started_col: 'Started',
  kpi_finished_col: 'Finished',
  kpi_rate_col: 'Rate',
  kpi_day_col: 'Day',

  // ── MaxErrorsModal ────────────────────────────────────────────
  maxerr_watch_ad_full: '📺 Watch an ad for +1 chance',
  maxerr_quit_full: 'End the game',

  // ── RematchComposer ───────────────────────────────────────────
  rc_result_msg: 'My result: {errors} error{s}, {min}m {sec}s. Can you do better?\n{link}',
  rc_photo_warning: '⚠️ This link gives access to a photo: only send it to the right person (deleted in {days} days).',
  rc_close_btn: 'Close',
  rc_desc: 'Your friend will play the exact same grid, and we\'ll compare your results once they finish.',

  // ── RematchResultDetail ───────────────────────────────────────
  rrd_friend_better: '😅 Your friend did better this time.',

  // ── WinModal ─────────────────────────────────────────────────
  win_difficulty_label: 'Difficulty: ',
  win_no_error: 'no errors 🏆',
  win_share_text: '{painting}Difficulty: {diff} — {time} — {errors}\nPlay too: https://sudoku-art.vercel.app',
  win_result_msg: 'Difficulty: {diff} — Errors: {errors} — Time: {time}',
  win_stats_row: '❌ {errors} error{s} — ⏱ {time}',
  win_table_raw: '⏱ Raw',
  win_table_score: '🏁 Score',

};

const TRANSLATIONS = { fr: FR, en: EN };

function detectLang() {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'fr' || stored === 'en') return stored;
  } catch {}
  const nav = (navigator.language || 'fr').toLowerCase();
  return nav.startsWith('fr') ? 'fr' : 'en';
}

export { LangContext };

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(detectLang);

  const setLang = (l) => {
    setLangState(l);
    try { localStorage.setItem(LANG_KEY, l); } catch {}
  };

  const t = (key, vars = {}) => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.fr;
    const str = dict[key] || TRANSLATIONS.fr[key] || key;
    return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useT() {
  return useContext(LangContext);
}

// Variable module pour translate() sans hook
var _moduleLang = (function() {
  try { var s = localStorage.getItem('sudoku-devoile:lang'); if (s==='fr'||s==='en') return s; } catch(e) {}
  return (navigator.language||'fr').toLowerCase().startsWith('fr') ? 'fr' : 'en';
})();

export function translate(key, vars) {
  const dict = TRANSLATIONS[_moduleLang] || TRANSLATIONS.fr;
  const str = (dict && dict[key]) || TRANSLATIONS.fr[key] || key;
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, function(_, k) {
    return vars[k] != null ? String(vars[k]) : '';
  });
}

export function setModuleLang(l) { _moduleLang = l; }
