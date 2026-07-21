import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { LangProvider } from './i18n/index.jsx';
import './index.css';
import { initTracking, installGlobalErrorTracking } from './lib/tracking';

initTracking();
installGlobalErrorTracking({ isGameInProgress: () => document.body.classList.contains('game-in-progress') });

ReactDOM.createRoot(document.getElementById('root')).render(
  <LangProvider>
    <App />
  </LangProvider>
);
