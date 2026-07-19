import { translate as t, useT } from '../i18n/index.jsx';
// src/components/AuthScreen.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { isMobileDevice } from '../utils/device';
import './AuthScreen.css';

const APP_URL = typeof window !== 'undefined' ? window.location.origin : '';
const SHARE_TEXT = lang === "fr" ? "Sudoku Art : un Sudoku où une photo se dévoile ! Essaie : " : "Sudoku Art: a Sudoku where a photo reveals itself! Try it: ";

export default function AuthScreen({ onCancel }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleShare = async () => {
    const text = SHARE_TEXT + APP_URL;
    try {
      if (isMobileDevice() && navigator.share) {
        await navigator.share({ title: 'Sudoku Art', text: SHARE_TEXT, url: APP_URL });
        return;
      }
    } catch {
      // partage annulé ou non disponible : on retombe sur WhatsApp Web
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setInfoMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        setInfoMessage(lang === 'fr' ? 'Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse.' : 'Account created! Check your email to confirm your address.');
        setMode('signin');
      } else if (mode === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: APP_URL
        });
        if (resetError) throw resetError;
        setInfoMessage(lang === 'fr' ? 'Email envoyé ! Clique sur le lien pour choisir un nouveau mot de passe.' : 'Email sent! Click the link to choose a new password.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err.message || t('auth_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-hero">
        <img src="/favicon.svg" alt="Logo Sudoku Art" className="auth-logo" />
        <h1>Sudoku Art</h1>
        <p className="auth-tagline">
          {onCancel
            ? (lang === 'fr' ? "Un compte permet d'envoyer des défis et de garder ta progression." : "An account lets you send challenges and save your progress.")
            : "Un Sudoku classique avec un twist : complète des carrés pour dévoiler, petit à petit, une photo cachée derrière la grille — la tienne, ou une image surprise qui change selon la saison."}
        </p>
        <button className="auth-share-btn" onClick={handleShare}>
          📤 Partager l'appli avec un ami
        </button>
      </div>

      {onCancel && (
        <button className="auth-free-play-btn" onClick={onCancel}>
          🎮 Jouer en partie libre (sans compte)
        </button>
      )}

      <div className="auth-card">
        {mode !== 'forgot' && (
          <div className="auth-tabs">
            <button
              className={mode === 'signin' ? 'active' : ''}
              onClick={() => switchMode('signin')}
            >
              Se connecter
            </button>
            <button
              className={mode === 'signup' ? 'active' : ''}
              onClick={() => switchMode('signup')}
            >
              Créer un compte
            </button>
          </div>
        )}

        {mode === 'forgot' && <h2 className="auth-forgot-title">{lang === 'fr' ? 'Mot de passe oublié' : 'Forgot password'}</h2>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          {mode !== 'forgot' && (
            <label>
              Mot de passe
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </label>
          )}

          {error && <p className="auth-error">{error}</p>}
          {infoMessage && <p className="auth-info">{infoMessage}</p>}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading
              ? 'Un instant…'
              : mode === 'signup'
                ? t('auth_create_btn')
                : mode === 'forgot'
                  ? t('auth_send_link')
                  : t('auth_signin_btn')}
          </button>

          {mode === 'signin' && (
            <button type="button" className="auth-link-btn" onClick={() => switchMode('forgot')}>
              Mot de passe oublié ?
            </button>
          )}
          {mode === 'forgot' && (
            <button type="button" className="auth-link-btn" onClick={() => switchMode('signin')}>
              ← Retour à la connexion
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
