import { useContext, useState } from 'react';
import LangContext from './context.js';
import fr from './fr.js';
import en from './en.js';
import de from './de.js';
import es from './es.js';
import zh from './zh.js';

const LANG_KEY = 'sudoku-devoile:lang';
const TRANSLATIONS = { fr, en, de, es, zh };
const SUPPORTED_LANGS = Object.keys(TRANSLATIONS);

function detectLang() {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (SUPPORTED_LANGS.includes(stored)) return stored;
  } catch {
    // localStorage indisponible (mode privé, etc.) : on retombe sur la langue du navigateur
  }
  const nav = ((typeof navigator !== 'undefined' && navigator.language) || 'fr').toLowerCase();
  // navigator.language est du type "de-DE", "zh-CN"... : on ne compare que le
  // préfixe avant le tiret pour retrouver l'un de nos codes supportés.
  const prefix = nav.split('-')[0];
  return SUPPORTED_LANGS.includes(prefix) ? prefix : 'en';
}

function translateWith(dict, key, vars) {
  const raw = dict[key] ?? TRANSLATIONS.fr[key] ?? key;
  const str = typeof raw === 'string' ? raw : key;
  if (import.meta.env.DEV && dict[key] === undefined) {
    console.warn(`[i18n] clé manquante : "${key}"`);
  }
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
}

export { LangContext, SUPPORTED_LANGS };

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(detectLang);

  // persistToProfile : userId optionnel — si fourni, la préférence est
  // aussi sauvegardée sur le profil Supabase (voir lib/profiles.js), pour
  // qu'un utilisateur connecté retrouve sa langue sur n'importe quel
  // appareil. Sans compte, seul localStorage (déjà per-appareil) persiste.
  const setLang = (l, { persistToProfile } = {}) => {
    if (!SUPPORTED_LANGS.includes(l)) return;
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      // stockage indisponible : la préférence ne persistera pas, tant pis
    }
    if (persistToProfile) {
      import('../lib/profiles.js').then(({ savePreferredLang }) => {
        savePreferredLang(persistToProfile, l).catch(() => null);
      });
    }
  };

  const t = (key, vars) => translateWith(TRANSLATIONS[lang] ?? TRANSLATIONS.fr, key, vars);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useT() {
  return useContext(LangContext);
}
