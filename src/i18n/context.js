import { createContext } from 'react';

// Contexte séparé — initialisé en premier, jamais en TDZ
const LangContext = createContext({
  lang: 'fr',
  setLang: () => {},
  t: (k) => k,
  getLang: () => 'fr',
});

export default LangContext;
