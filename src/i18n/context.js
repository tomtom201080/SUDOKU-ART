import { createContext } from 'react';

// Fichier séparé pour éviter tout problème d'ordre d'initialisation.
// LangContext doit être initialisé AVANT que quoi que ce soit d'autre ne l'utilise.
const LangContext = createContext({
  lang: 'fr',
  setLang: () => {},
  t: (k) => k,
});

export default LangContext;
