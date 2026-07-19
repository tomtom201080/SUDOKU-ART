import { createContext } from 'react';

// Utilisation de module.exports style via une IIFE pour garantir
// que la valeur est disponible immédiatement, sans TDZ
var LangContext = createContext({
  lang: 'fr',
  setLang: () => {},
  t: (k) => k,
});

export default LangContext;
