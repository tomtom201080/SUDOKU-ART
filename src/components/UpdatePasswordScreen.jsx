import { useT } from '../i18n/index.jsx';
// src/components/UpdatePasswordScreen.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './AuthScreen.css';

export default function UpdatePasswordScreen({ onDone }) {
  const { t } = useT();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('upd_mismatch'));
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
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
        <h1>{t('upd_title')}</h1>
        <p className="auth-tagline">
          {t('upd_subtitle')}
        </p>
      </div>

      <div className="auth-card">
        {success ? (
          <>
            <p className="auth-info">{t('upd_success')}</p>
            <button className="auth-submit-btn" onClick={onDone}>
              {t('upd_continue_btn')}
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              {t('upd_new_password_label')}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </label>

            <label>
              {t('upd_confirm_password_label')}
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </label>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? t('common_one_moment') : t('upd_btn')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
