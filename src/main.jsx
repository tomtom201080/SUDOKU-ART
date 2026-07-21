import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import { LangProvider } from './i18n/index.jsx';
import SeoLandingPage from './components/seo/SeoLandingPage.jsx';
import { SEO_PAGES } from './seo/pages.jsx';
import './index.css';
import { initTracking, installGlobalErrorTracking } from './lib/tracking';

initTracking();
installGlobalErrorTracking({ isGameInProgress: () => document.body.classList.contains('game-in-progress') });

// L'app de jeu (état interne, aucune dépendance au routeur — voir App.jsx)
// reste montée sur "/" exactement comme avant. Les nouvelles pages SEO sont
// des routes indépendantes, sans aucun partage d'état avec le jeu.
ReactDOM.createRoot(document.getElementById('root')).render(
  <LangProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        {SEO_PAGES.map(page => (
          <Route key={page.slug} path={`/${page.slug}`} element={<SeoLandingPage page={page} />} />
        ))}
      </Routes>
    </BrowserRouter>
  </LangProvider>
);
