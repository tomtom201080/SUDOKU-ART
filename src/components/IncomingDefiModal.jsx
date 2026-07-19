import { useT } from '../i18n/index.jsx';
// src/components/IncomingDefiModal.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './QuitConfirmModal.css';
import './IncomingDefiModal.css';



// Vérifie que le pseudo n'est pas déjà pris dans CE défi
async function checkPseudoAvailableForDefi(rematchId, pseudo) {
  const { t } = useT();

  const { data } = await supabase
    .from('rematch_results')
    .select('id')
    .eq('rematch_id', rematchId)
    .ilike('player_name', pseudo.trim())
    .maybeSingle();
  return !data; // true = disponible
}

export default function IncomingDefiModal({ rematch, onLogin, onPlayFree }) {
  const [step, setStep] = useState('choice'); // 'choice' | 'pseudo'
  const [pseudo, setPseudo] = useState('');
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);
  const diffLabel = (d) => ({ facile: t('diff_facile'), moyen: t('diff_moyen'), complique: t('diff_complique'), enfer: t('diff_enfer') })[d] ?? d;
  const challengerName = rematch?.challenger_name ?? t('incoming_a_friend');
  const diff       = diffLabel(rematch?.difficulty) ?? rematch?.difficulty ?? '';
  const hasPhoto   = !!rematch?.photo_path;
  const hintsLimit = rematch?.hints_limit;
  const isGroup    = !!rematch?.group_mode;

  const handlePlayFreeClick = () => {
    if (isGroup) {
      // Mode groupe sans compte → demander un pseudo local au défi
      setStep('pseudo');
    } else {
      onPlayFree(null);
    }
  };

  const handleSubmitPseudo = async () => {
    const trimmed = pseudo.trim();
    if (trimmed.length < 2) { setError(t('incoming_pseudo_short')); return; }
    if (trimmed.length > 20) { setError(t('incoming_pseudo_long')); return; }

    setChecking(true);
    setError(null);
    try {
      const available = await checkPseudoAvailableForDefi(rematch.id, trimmed);
      if (!available) {
        setError(t('incoming_pseudo_taken'));
        setChecking(false);
        return;
      }
      onPlayFree(trimmed);
    } catch {
      setError(t('incoming_pseudo_error'));
      setChecking(false);
    }
  };

  return (
    <div className="quit-overlay">
      <div className="quit-panel">
        <p className="quit-icon">🎯</p>
        <h2 className="quit-title">{t('incoming_challenges_you', { name: challengerName })}</h2>

        <div className="incoming-defi-info">
          <span>🎮 {diff}</span>
          {isGroup && <span>{t('incoming_group')}</span>}
          {hasPhoto && <span>📷 Photo cachée</span>}
          {hintsLimit != null && <span>💡 Max {hintsLimit}</span>}
          <span>{t('incoming_rule_short')}</span>
        </div>

        {step === 'choice' && (
          <>
            <p className="incoming-defi-note">
              Connecte-toi pour que ton score soit rattaché à ton compte et visible par {challengerName}.
            </p>
            <div className="quit-actions">
              <button className="quit-btn-primary" onClick={onLogin}>
                👤 Se connecter / S'inscrire
              </button>
              <button className="quit-btn-login" onClick={handlePlayFreeClick}>
                🎮 Jouer en participation libre
              </button>
            </div>
          </>
        )}

        {step === 'pseudo' && (
          <>
            <p className="incoming-defi-note">{t('incoming_pseudo_desc')}</p>
            <input
              className="incoming-pseudo-input"
              type="text"
              maxLength={20}
              value={pseudo}
              onChange={e => { setPseudo(e.target.value); setError(null); }}
              placeholder={t('incoming_pseudo_placeholder')}
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              onKeyDown={e => e.key === 'Enter' && handleSubmitPseudo()}
            />
            {error && <p className="incoming-pseudo-error">{error}</p>}
            <div className="quit-actions">
              <button
                className="quit-btn-primary"
                onClick={handleSubmitPseudo}
                disabled={checking}
              >
                {checking ? t('incoming_pseudo_checking') : '▶ Jouer avec ce pseudo'}
              </button>
              <button className="quit-btn-quit" onClick={() => setStep('choice')}>
                ← Retour
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
