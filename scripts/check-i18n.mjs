// Vérifie que src/i18n/fr.js et src/i18n/en.js exposent exactement les
// mêmes clés, sans valeur vide. Échoue le build (code de sortie non nul)
// en cas d'écart, pour ne plus jamais laisser une traduction divergente
// atteindre la production.
import fr from '../src/i18n/fr.js';
import en from '../src/i18n/en.js';

const frKeys = new Set(Object.keys(fr));
const enKeys = new Set(Object.keys(en));

const missingInEn = [...frKeys].filter(k => !enKeys.has(k));
const missingInFr = [...enKeys].filter(k => !frKeys.has(k));
const emptyInFr = Object.entries(fr).filter(([, v]) => v === '' || v == null).map(([k]) => k);
const emptyInEn = Object.entries(en).filter(([, v]) => v === '' || v == null).map(([k]) => k);

let hasError = false;

if (missingInEn.length) {
  hasError = true;
  console.error(`❌ Clés présentes dans fr.js mais absentes de en.js (${missingInEn.length}) :`);
  missingInEn.forEach(k => console.error(`   - ${k}`));
}

if (missingInFr.length) {
  hasError = true;
  console.error(`❌ Clés présentes dans en.js mais absentes de fr.js (${missingInFr.length}) :`);
  missingInFr.forEach(k => console.error(`   - ${k}`));
}

if (emptyInFr.length) {
  hasError = true;
  console.error(`❌ Valeurs vides dans fr.js (${emptyInFr.length}) :`);
  emptyInFr.forEach(k => console.error(`   - ${k}`));
}

if (emptyInEn.length) {
  hasError = true;
  console.error(`❌ Valeurs vides dans en.js (${emptyInEn.length}) :`);
  emptyInEn.forEach(k => console.error(`   - ${k}`));
}

if (hasError) {
  process.exit(1);
}

console.log(`✅ i18n OK — ${frKeys.size} clés, parité fr/en complète.`);
