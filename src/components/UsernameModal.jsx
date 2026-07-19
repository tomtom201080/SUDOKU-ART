import { useT } from '../i18n/index.jsx';
// src/components/UsernameModal.jsx
import { useState } from 'react';
import { validateUsername, checkUsernameAvailable, saveUsername } from '../lib/profiles';
import './UsernameModal.css';

export default function UsernameModal({ userId, onDone }) {
  const { t } = useT();
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'saving' | 'done'

  const handleChange = (e) => {
    setValue(e.target.value);
    setError(null);
  };

  const handleSubmit = async () => {
    const validationError = validateUsername(value);
    if (validationError) { setError(validationError); return; }

    setChecking(true);
    setError(null);

    try {
      const available = await checkUsernameAvailable(value);
      if (!available) {
        setError(t('uname_taken'));
        setChecking(false);
        return;
      }

      setStatus('saving');
      await saveUsername(userId, value);
      setStatus('done');
      setTimeout(() => onDone(value.trim()), 600);
    } catch (err) {
      setError(t('uname_error'));
      setChecking(false);
      setStatus('idle');
    }
  };

  return (
    <div className="username-overlay">
      <div className="username-panel">
        <p className="username-icon">🎭</p>
        <h2 className="username-title">{t('uname_title')}</h2>
        <p className="username-desc">
          {t('uname_desc')}
        </p>
        <p className="username-rules">{t('uname_rules')}</p>
        <input
          className="username-input"
          type="text"
          maxLength={20}
          value={value}
          onChange={handleChange}
          placeholder={t('uname_placeholder')}
          autoFocus
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
        {error && <p className="username-error">{error}</p>}
        <button
          className="username-btn"
          onClick={handleSubmit}
          disabled={status === 'saving' || checking}
        >
          {status === 'saving' ? t('uname_saving') :
           status === 'done'   ? t('uname_done') :
           checking            ? t('uname_checking') :
           t('uname_btn')}
        </button>
      </div>
    </div>
  );
}
