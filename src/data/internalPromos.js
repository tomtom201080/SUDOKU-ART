// src/data/internalPromos.js
// Contenu des publicités internes affichées à la place d'AdSense (voir
// getAdProvider() dans lib/adsense.js) — chaque entrée illustre UNE seule
// idée d'utilisation de Sudoku Art, jamais une liste de fonctionnalités.
// Les textes eux-mêmes vivent dans les fichiers i18n (titleKey/textKey/
// ctaKey) : ce fichier ne fait que décrire la structure, pas le contenu.
//
// @typedef {Object} InternalPromo
// @property {string} id - identifiant stable (aussi utilisé pour l'anti-répétition et l'analytics)
// @property {string} category - regroupement thématique (pas affiché, utile pour trier/filtrer plus tard)
// @property {string} icon - emoji de repli, utilisé tel quel (voir composant InternalPromo)
// @property {string} titleKey - clé i18n du titre court
// @property {string} textKey - clé i18n de la phrase d'accroche
// @property {string} ctaKey - clé i18n du texte du bouton
// @property {string} destination - identifiant de scénario (analytics uniquement, ne déclenche aucune navigation)
// @property {Array<'banner'|'interstitial'>} supportedFormats

export const INTERNAL_PROMOS = [
  { id: 'proposal', category: 'love', icon: '💍', titleKey: 'promo_proposal_title', textKey: 'promo_proposal_text', ctaKey: 'promo_proposal_cta', destination: 'proposal', supportedFormats: ['banner', 'interstitial'] },
  { id: 'pregnancy', category: 'family', icon: '🤰', titleKey: 'promo_pregnancy_title', textKey: 'promo_pregnancy_text', ctaKey: 'promo_pregnancy_cta', destination: 'pregnancy', supportedFormats: ['banner', 'interstitial'] },
  { id: 'gender-reveal', category: 'family', icon: '🍼', titleKey: 'promo_gender_reveal_title', textKey: 'promo_gender_reveal_text', ctaKey: 'promo_gender_reveal_cta', destination: 'gender-reveal', supportedFormats: ['banner', 'interstitial'] },
  { id: 'birth', category: 'family', icon: '👶', titleKey: 'promo_birth_title', textKey: 'promo_birth_text', ctaKey: 'promo_birth_cta', destination: 'birth', supportedFormats: ['banner', 'interstitial'] },
  { id: 'grandparents-memory', category: 'family', icon: '👵', titleKey: 'promo_grandparents_memory_title', textKey: 'promo_grandparents_memory_text', ctaKey: 'promo_grandparents_memory_cta', destination: 'family-memory', supportedFormats: ['banner', 'interstitial'] },
  { id: 'birthday', category: 'celebration', icon: '🎂', titleKey: 'promo_birthday_title', textKey: 'promo_birthday_text', ctaKey: 'promo_birthday_cta', destination: 'birthday', supportedFormats: ['banner', 'interstitial'] },
  { id: 'love-declaration', category: 'love', icon: '❤️', titleKey: 'promo_love_declaration_title', textKey: 'promo_love_declaration_text', ctaKey: 'promo_love_declaration_cta', destination: 'secret-message', supportedFormats: ['banner', 'interstitial'] },
  { id: 'valentine', category: 'love', icon: '💌', titleKey: 'promo_valentine_title', textKey: 'promo_valentine_text', ctaKey: 'promo_valentine_cta', destination: 'secret-message', supportedFormats: ['banner', 'interstitial'] },
  { id: 'family-photo', category: 'family', icon: '📸', titleKey: 'promo_family_photo_title', textKey: 'promo_family_photo_text', ctaKey: 'promo_family_photo_cta', destination: 'family-memory', supportedFormats: ['banner', 'interstitial'] },
  { id: 'old-photo', category: 'family', icon: '🖼️', titleKey: 'promo_old_photo_title', textKey: 'promo_old_photo_text', ctaKey: 'promo_old_photo_cta', destination: 'family-memory', supportedFormats: ['banner', 'interstitial'] },
  { id: 'christmas', category: 'celebration', icon: '🎄', titleKey: 'promo_christmas_title', textKey: 'promo_christmas_text', ctaKey: 'promo_christmas_cta', destination: 'gift', supportedFormats: ['banner', 'interstitial'] },
  { id: 'gift', category: 'celebration', icon: '🎁', titleKey: 'promo_gift_title', textKey: 'promo_gift_text', ctaKey: 'promo_gift_cta', destination: 'gift', supportedFormats: ['banner', 'interstitial'] },
  { id: 'travel', category: 'celebration', icon: '✈️', titleKey: 'promo_travel_title', textKey: 'promo_travel_text', ctaKey: 'promo_travel_cta', destination: 'travel', supportedFormats: ['banner', 'interstitial'] },
  { id: 'vacation-photo', category: 'celebration', icon: '🏖️', titleKey: 'promo_vacation_photo_title', textKey: 'promo_vacation_photo_text', ctaKey: 'promo_vacation_photo_cta', destination: 'travel', supportedFormats: ['banner', 'interstitial'] },
  { id: 'mothers-day', category: 'family', icon: '🌷', titleKey: 'promo_mothers_day_title', textKey: 'promo_mothers_day_text', ctaKey: 'promo_mothers_day_cta', destination: 'family-memory', supportedFormats: ['banner', 'interstitial'] },
  { id: 'fathers-day', category: 'family', icon: '👨', titleKey: 'promo_fathers_day_title', textKey: 'promo_fathers_day_text', ctaKey: 'promo_fathers_day_cta', destination: 'family-memory', supportedFormats: ['banner', 'interstitial'] },
  { id: 'grandmothers-day', category: 'family', icon: '💐', titleKey: 'promo_grandmothers_day_title', textKey: 'promo_grandmothers_day_text', ctaKey: 'promo_grandmothers_day_cta', destination: 'family-memory', supportedFormats: ['banner', 'interstitial'] },
  { id: 'wedding', category: 'love', icon: '💒', titleKey: 'promo_wedding_title', textKey: 'promo_wedding_text', ctaKey: 'promo_wedding_cta', destination: 'wedding', supportedFormats: ['banner', 'interstitial'] },
  { id: 'invitation', category: 'celebration', icon: '✉️', titleKey: 'promo_invitation_title', textKey: 'promo_invitation_text', ctaKey: 'promo_invitation_cta', destination: 'invitation', supportedFormats: ['banner', 'interstitial'] },
  { id: 'graduation', category: 'achievement', icon: '🎓', titleKey: 'promo_graduation_title', textKey: 'promo_graduation_text', ctaKey: 'promo_graduation_cta', destination: 'achievement', supportedFormats: ['banner', 'interstitial'] },
  { id: 'school-result', category: 'achievement', icon: '🏆', titleKey: 'promo_school_result_title', textKey: 'promo_school_result_text', ctaKey: 'promo_school_result_cta', destination: 'achievement', supportedFormats: ['banner', 'interstitial'] },
  { id: 'teacher-thanks', category: 'achievement', icon: '🍎', titleKey: 'promo_teacher_thanks_title', textKey: 'promo_teacher_thanks_text', ctaKey: 'promo_teacher_thanks_cta', destination: 'secret-message', supportedFormats: ['banner', 'interstitial'] },
  { id: 'retirement', category: 'work', icon: '🥂', titleKey: 'promo_retirement_title', textKey: 'promo_retirement_text', ctaKey: 'promo_retirement_cta', destination: 'secret-message', supportedFormats: ['banner', 'interstitial'] },
  { id: 'coworker', category: 'work', icon: '💼', titleKey: 'promo_coworker_title', textKey: 'promo_coworker_text', ctaKey: 'promo_coworker_cta', destination: 'secret-message', supportedFormats: ['banner', 'interstitial'] },
  { id: 'housewarming', category: 'celebration', icon: '🏠', titleKey: 'promo_housewarming_title', textKey: 'promo_housewarming_text', ctaKey: 'promo_housewarming_cta', destination: 'invitation', supportedFormats: ['banner', 'interstitial'] },
  { id: 'new-pet', category: 'family', icon: '🐶', titleKey: 'promo_new_pet_title', textKey: 'promo_new_pet_text', ctaKey: 'promo_new_pet_cta', destination: 'family-memory', supportedFormats: ['banner', 'interstitial'] },
  { id: 'halloween', category: 'seasonal', icon: '🎃', titleKey: 'promo_halloween_title', textKey: 'promo_halloween_text', ctaKey: 'promo_halloween_cta', destination: 'gift', supportedFormats: ['banner', 'interstitial'] },
  { id: 'easter', category: 'seasonal', icon: '🐣', titleKey: 'promo_easter_title', textKey: 'promo_easter_text', ctaKey: 'promo_easter_cta', destination: 'gift', supportedFormats: ['banner', 'interstitial'] },
  { id: 'april-fools', category: 'seasonal', icon: '🐟', titleKey: 'promo_april_fools_title', textKey: 'promo_april_fools_text', ctaKey: 'promo_april_fools_cta', destination: 'secret-message', supportedFormats: ['banner', 'interstitial'] },
  { id: 'secret-message', category: 'love', icon: '🔐', titleKey: 'promo_secret_message_title', textKey: 'promo_secret_message_text', ctaKey: 'promo_secret_message_cta', destination: 'secret-message', supportedFormats: ['banner', 'interstitial'] },
  { id: 'friend-challenge', category: 'social', icon: '⚡', titleKey: 'promo_friend_challenge_title', textKey: 'promo_friend_challenge_text', ctaKey: 'promo_friend_challenge_cta', destination: 'friend-challenge', supportedFormats: ['banner', 'interstitial'] },
  { id: 'couple-memory', category: 'love', icon: '🥰', titleKey: 'promo_couple_memory_title', textKey: 'promo_couple_memory_text', ctaKey: 'promo_couple_memory_cta', destination: 'family-memory', supportedFormats: ['banner', 'interstitial'] },
  { id: 'childhood-photo', category: 'family', icon: '🧸', titleKey: 'promo_childhood_photo_title', textKey: 'promo_childhood_photo_text', ctaKey: 'promo_childhood_photo_cta', destination: 'family-memory', supportedFormats: ['banner', 'interstitial'] },
  { id: 'family-reunion', category: 'family', icon: '👨‍👩‍👧‍👦', titleKey: 'promo_family_reunion_title', textKey: 'promo_family_reunion_text', ctaKey: 'promo_family_reunion_cta', destination: 'invitation', supportedFormats: ['banner', 'interstitial'] },
  { id: 'artwork', category: 'art', icon: '🎨', titleKey: 'promo_artwork_title', textKey: 'promo_artwork_text', ctaKey: 'promo_artwork_cta', destination: 'artwork', supportedFormats: ['banner', 'interstitial'] },
  { id: 'home-museum', category: 'art', icon: '🏛️', titleKey: 'promo_home_museum_title', textKey: 'promo_home_museum_text', ctaKey: 'promo_home_museum_cta', destination: 'artwork', supportedFormats: ['banner', 'interstitial'] }
];

export function getAllPromoIds() {
  return INTERNAL_PROMOS.map(p => p.id);
}
