import { createContext, useContext, useState } from 'react';

const LANG_KEY = 'sudoku-devoile:lang';

function detectLang() {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'fr' || stored === 'en') return stored;
  } catch {}
  const nav = (navigator.language || 'fr').toLowerCase();
  return nav.startsWith('fr') ? 'fr' : 'en';
}

// Chargement lazy des traductions pour éviter les circular deps
let _translations = null;
function getTranslations() {
  if (_translations) return _translations;
  // Import statique mais accédé uniquement au runtime
  const fr = require('./fr.js').default;
  const en = require('./en.js').default;
  _translations = { fr, en };
  return _translations;
}

export const LangContext = createContext({
  lang: 'fr',
  setLang: () => {},
  t: (k) => k,
});

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(detectLang);

  const setLang = (l) => {
    setLangState(l);
    try { localStorage.setItem(LANG_KEY, l); } catch {}
  };

  const t = (key, vars = {}) => {
    const translations = getTranslations();
    const dict = translations[lang] || translations.fr;
    const str = dict[key] || translations.fr[key] || key;
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
