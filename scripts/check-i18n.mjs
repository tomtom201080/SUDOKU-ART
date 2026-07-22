// Vérifie que tous les dictionnaires src/i18n/*.js (fr, en, de, es, zh)
// exposent exactement les mêmes clés, sans valeur vide. Échoue le build
// (code de sortie non nul) en cas d'écart, pour ne plus jamais laisser une
// traduction divergente ou manquante atteindre la production. fr.js reste
// la référence : toute clé présente ailleurs mais absente de fr.js est
// elle aussi signalée (fr.js est la source de vérité pour l'ensemble des
// clés existantes).
import fr from '../src/i18n/fr.js';
import en from '../src/i18n/en.js';
import de from '../src/i18n/de.js';
import es from '../src/i18n/es.js';
import zh from '../src/i18n/zh.js';

const LANGS = { fr, en, de, es, zh };
const REFERENCE = 'fr';
const referenceKeys = new Set(Object.keys(LANGS[REFERENCE]));

let hasError = false;
let totalKeys = referenceKeys.size;

for (const [lang, dict] of Object.entries(LANGS)) {
  if (lang === REFERENCE) continue;
  const keys = new Set(Object.keys(dict));

  const missing = [...referenceKeys].filter(k => !keys.has(k));
  const extra = [...keys].filter(k => !referenceKeys.has(k));

  if (missing.length) {
    hasError = true;
    console.error(`❌ Clés présentes dans ${REFERENCE}.js mais absentes de ${lang}.js (${missing.length}) :`);
    missing.forEach(k => console.error(`   - ${k}`));
  }
  if (extra.length) {
    hasError = true;
    console.error(`❌ Clés présentes dans ${lang}.js mais absentes de ${REFERENCE}.js (${extra.length}) :`);
    extra.forEach(k => console.error(`   - ${k}`));
  }
}

for (const [lang, dict] of Object.entries(LANGS)) {
  const empty = Object.entries(dict).filter(([, v]) => v === '' || v == null).map(([k]) => k);
  if (empty.length) {
    hasError = true;
    console.error(`❌ Valeurs vides dans ${lang}.js (${empty.length}) :`);
    empty.forEach(k => console.error(`   - ${k}`));
  }
}

if (hasError) {
  process.exit(1);
}

console.log(`✅ i18n OK — ${totalKeys} clés, parité ${Object.keys(LANGS).join('/')} complète.`);
