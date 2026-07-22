// src/components/MemoriesDashboard.jsx
import { useT } from '../i18n/index.jsx';
import { useState, useEffect } from 'react';
import { fetchSentChallenges, fetchReceivedChallenges, deleteChallenge, purgeExpiredChallenges } from '../lib/challenges';
import './DefiDashboard.css';

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function ChallengeRow({ c, isSent, onDelete, deletingId }) {
  const { t } = useT();
  const diffLabel = (d) => ({ facile: t('diff_facile'), moyen: t('diff_moyen'), complique: t('diff_complique'), enfer: t('diff_enfer') })[d] ?? d;

  return (
    <div className="defi-row">
      <div className="defi-row-left">
        <span className="defi-row-opponent">
          {isSent ? t('dd_sent_label') : (c.sender_email || t('defi_a_friend'))}
        </span>
        <span className="defi-row-meta">
          {diffLabel(c.difficulty_mode)} · {fmtDate(c.created_at)}
        </span>
      </div>
      <div className="defi-row-right">
        {!c.completed && <span className="defi-row-waiting">{t('defi_waiting')}</span>}
        {c.completed && (
          <div className={`defi-result-badge ${c.result === 'won' ? 'won' : 'lost'}`}>
            {c.result === 'won' ? t('dd_won') : t('dd_lost')}
          </div>
        )}
        <button
          className="defi-row-delete"
          onClick={() => onDelete(c)}
          disabled={deletingId === c.id}
          title={t('dd_delete_title')}
        >🗑</button>
      </div>
    </div>
  );
}

// onCreateChallenge (optionnel) : affiche un bouton "créer" en haut du
// tableau (calqué sur DefiDashboard) — absent quand ce tableau est ouvert
// depuis l'intérieur même de l'écran de création (ChallengeComposer), où un
// second bouton "créer" serait redondant.
export default function MemoriesDashboard({ userId, onClose, onCreateChallenge = null }) {
  const { t } = useT();
  const [tab, setTab] = useState('sent');
  const [sent, setSent] = useState(null);
  const [received, setReceived] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!userId) { setSent([]); setReceived([]); return; }
    // Nettoyage différé (défis terminés depuis plus de 7 jours) déclenché à
    // chaque ouverture du tableau — voir le commentaire dans lib/challenges.js.
    purgeExpiredChallenges(userId).finally(() => {
      fetchSentChallenges(userId).then(setSent);
      fetchReceivedChallenges(userId).then(setReceived);
    });
  }, [userId]);

  const handleDelete = async (challenge) => {
    if (!window.confirm(t('mem_delete_confirm'))) return;
    setDeletingId(challenge.id);
    try {
      await deleteChallenge(challenge.id, challenge.photo_path);
      setSent(prev => prev?.filter(c => c.id !== challenge.id) ?? prev);
      setReceived(prev => prev?.filter(c => c.id !== challenge.id) ?? prev);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const isSent = tab === 'sent';
  const list = isSent ? sent : received;

  return (
    <div className="defi-dash-overlay" onClick={onClose}>
      <div className="defi-dash-panel" onClick={e => e.stopPropagation()}>
        <div className="defi-dash-header">
          <h2>{t('mem_dash_title')}</h2>
          <button className="defi-dash-close" onClick={onClose}>✕</button>
        </div>

        {!userId && <p className="defi-dash-empty">{t('mem_dash_login_required')}</p>}

        {userId && (
          <>
            {onCreateChallenge && (
              <button className="defi-dash-create" onClick={onCreateChallenge}>
                {t('mem_dash_create')}
              </button>
            )}

            <div className="defi-dash-tabs">
              <button className={`defi-tab ${isSent ? 'is-active' : ''}`} onClick={() => setTab('sent')}>
                {t('defi_tab_sent')} {sent && `(${sent.length})`}
              </button>
              <button className={`defi-tab ${!isSent ? 'is-active' : ''}`} onClick={() => setTab('received')}>
                {t('defi_tab_received')} {received && `(${received.length})`}
              </button>
            </div>

            <div className="defi-dash-list">
              {list === null && <p className="defi-dash-empty">{t('defi_loading')}</p>}
              {list?.length === 0 && (
                <p className="defi-dash-empty">{isSent ? t('mem_dash_empty') : t('mem_empty_received')}</p>
              )}
              {list?.map(c => (
                <ChallengeRow key={c.id} c={c} isSent={isSent} onDelete={handleDelete} deletingId={deletingId} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
