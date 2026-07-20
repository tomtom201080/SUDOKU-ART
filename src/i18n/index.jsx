import { useContext, useState } from 'react';
import LangContext from './context.js';
import fr from './fr.js';
import en from './en.js';

const LANG_KEY = 'sudoku-devoile:lang';
const TRANSLATIONS = { fr, en };

function detectLang() {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'fr' || stored === 'en') return stored;
  } catch {
    // localStorage indisponible (mode privé, etc.) : on retombe sur la langue du navigateur
  }
  const nav = (typeof navigator !== 'undefined' && navigator.language) || 'fr';
  return nav.toLowerCase().startsWith('fr') ? 'fr' : 'en';
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

export { LangContext };

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(detectLang);

  const setLang = (l) => {
    if (l !== 'fr' && l !== 'en') return;
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      // stockage indisponible : la préférence ne persistera pas, tant pis
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
