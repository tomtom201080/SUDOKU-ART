// src/components/MemoriesDashboard.jsx
import { useT } from '../i18n/index.jsx';
import { useState, useEffect } from 'react';
import { fetchSentChallenges, deleteChallenge } from '../lib/challenges';
import './DefiDashboard.css';

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function MemoriesDashboard({ userId, onClose }) {
  const { t } = useT();
  const [list, setList] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const diffLabel = (d) => ({ facile: t('diff_facile'), moyen: t('diff_moyen'), complique: t('diff_complique'), enfer: t('diff_enfer') })[d] ?? d;

  useEffect(() => {
    if (!userId) { setList([]); return; }
    fetchSentChallenges(userId).then(setList).catch(() => setList([]));
  }, [userId]);

  // Suppression manuelle depuis l'historique : autorisée même si le défi n'a
  // jamais été joué (ex. mauvaise photo envoyée par erreur). Supprime aussi
  // la photo — le destinataire qui a encore le lien perd alors l'accès.
  const handleDelete = async (challenge) => {
    if (!window.confirm(t('mem_delete_confirm'))) return;
    setDeletingId(challenge.id);
    try {
      await deleteChallenge(challenge.id, challenge.photo_path);
      setList(prev => prev.filter(c => c.id !== challenge.id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="defi-dash-overlay" onClick={onClose}>
      <div className="defi-dash-panel" onClick={e => e.stopPropagation()}>
        <div className="defi-dash-header">
          <h2>{t('mem_dash_title')}</h2>
          <button className="defi-dash-close" onClick={onClose}>✕</button>
        </div>

        {!userId && <p className="defi-dash-empty">{t('mem_dash_login_required')}</p>}

        {userId && (
          <div className="defi-dash-list">
            {list === null && <p className="defi-dash-empty">{t('defi_loading')}</p>}
            {list?.length === 0 && <p className="defi-dash-empty">{t('mem_dash_empty')}</p>}
            {list?.map(c => (
              <div className="defi-row" key={c.id}>
                <div className="defi-row-left">
                  <span className="defi-row-opponent">{diffLabel(c.difficulty_mode)}</span>
                  <span className="defi-row-meta">{fmtDate(c.created_at)}</span>
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
                    onClick={() => handleDelete(c)}
                    disabled={deletingId === c.id}
                    title={t('dd_delete_title')}
                  >🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
