import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import { LangProvider } from './i18n/index.jsx';
import SeoLandingPage from './components/seo/SeoLandingPage.jsx';
import { getAllSeoRoutes } from './seo/pages.jsx';
import './index.css';
import { initTracking, installGlobalErrorTracking } from './lib/tracking';

initTracking();
installGlobalErrorTracking({ isGameInProgress: () => document.body.classList.contains('game-in-progress') });

// L'app de jeu (état interne, aucune dépendance au routeur — voir App.jsx)
// reste montée sur "/" exactement comme avant. "/g/:id" (QR de partage sous
// la grille, voir src/lib/sharedGrids.js) rend aussi <App/> telle quelle :
// l'id est lu depuis window.location.pathname (readSharedGridIdFromPath),
// pas via useParams, pour ne pas donner à App.jsx de dépendance au routeur.
// Les pages SEO sont des routes indépendantes, sans aucun partage d'état
// avec le jeu — une par combinaison langue × page (voir src/seo/languages.js
// et pages.jsx).
ReactDOM.createRoot(document.getElementById('root')).render(
  <LangProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/g/:id" element={<App />} />
        {getAllSeoRoutes().map(({ path, lang, page }) => (
          <Route key={path} path={path} element={<SeoLandingPage page={page} lang={lang} />} />
        ))}
      </Routes>
    </BrowserRouter>
  </LangProvider>
);
