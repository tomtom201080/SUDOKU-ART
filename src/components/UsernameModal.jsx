// src/components/UsernameModal.jsx
import { useState } from 'react';
import { validateUsername, checkUsernameAvailable, saveUsername } from '../lib/profiles';
import './UsernameModal.css';

export default function UsernameModal({ userId, onDone }) {
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
        setError('Ce pseudo est déjà pris. Essaie avec un autre.');
        setChecking(false);
        return;
      }

      setStatus('saving');
      await saveUsername(userId, value);
      setStatus('done');
      setTimeout(() => onDone(value.trim()), 600);
    } catch (err) {
      setError('Une erreur s\'est produite. Réessaie.');
      setChecking(false);
      setStatus('idle');
    }
  };

  return (
    <div className="username-overlay">
      <div className="username-panel">
        <p className="username-icon">🎭</p>
        <h2 className="username-title">Choisis ton pseudo</h2>
        <p className="username-desc">
          Il sera visible par les autres joueurs quand tu envoies un défi.
          Tu peux le changer plus tard depuis les paramètres.
        </p>
        <p className="username-rules">3 à 20 caractères · lettres, chiffres, _ et -</p>
        <input
          className="username-input"
          type="text"
          maxLength={20}
          value={value}
          onChange={handleChange}
          placeholder="ex : SuperJoueur42"
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
          {status === 'saving' ? 'Enregistrement…' :
           status === 'done'   ? '✅ Pseudo enregistré !' :
           checking            ? 'Vérification…' :
           'Valider mon pseudo'}
        </button>
      </div>
    </div>
  );
}
