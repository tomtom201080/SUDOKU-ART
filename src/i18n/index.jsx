import { createContext, useContext, useEffect, useState } from 'react';
import fr from './fr.js';
import en from './en.js';

const TRANSLATIONS = { fr, en };
const LANG_KEY = 'sudoku-devoile:lang';

function detectLang() {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'fr' || stored === 'en') return stored;
  } catch {}
  const nav = (navigator.language || navigator.userLanguage || 'fr').toLowerCase();
  return nav.startsWith('fr') ? 'fr' : 'en';
}

export const LangContext = createContext({ lang: 'fr', setLang: () => {}, t: (k) => k });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(detectLang);

  const setLang = (l) => {
    setLangState(l);
    try { localStorage.setItem(LANG_KEY, l); } catch {}
  };

  // Traduction avec interpolation simple : t('hint_wait', {n:3, s:'s'})
  const t = (key, vars = {}) => {
    const str = (TRANSLATIONS[lang] || TRANSLATIONS.fr)[key] || (TRANSLATIONS.fr[key]) || key;
    return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
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
