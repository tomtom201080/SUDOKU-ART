// src/components/MemoriesDashboard.jsx
import { useT } from '../i18n/index.jsx';
import { useState, useEffect } from 'react';
import { fetchSentChallenges, fetchReceivedChallenges, deleteChallenge, purgeExpiredChallenges } from '../lib/challenges';
import { getSharedPhotoPublicUrl } from '../lib/sharedPhoto';
import './DefiDashboard.css';

// Rafraîchissement périodique pendant que le tableau reste ouvert, pour que
// le statut "en cours" (et sa synthèse) avance sans avoir à refermer/rouvrir.
const REFRESH_INTERVAL_MS = 15000;

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function fmtMMSS(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds ?? 0));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// Statut d'une Memory : en attente (jamais ouverte), en cours (ouverte,
// partie non terminée — synthèse %, temps, erreurs, indices), ou terminée
// (résultat gagné/perdu). Partagé entre la ligne et le détail.
function ChallengeStatus({ c }) {
  const { t } = useT();

  if (c.completed) {
    return (
      <div className={`defi-result-badge ${c.result === 'won' ? 'won' : 'lost'}`}>
        {c.result === 'won' ? t('dd_won') : t('dd_lost')}
      </div>
    );
  }

  if (c.started_at) {
    return (
      <div className="defi-row-progress">
        <span className="defi-badge defi-badge-pending">{t('status_in_progress')}</span>
        <span className="defi-row-meta">
          {t('progress_summary', {
            percent: c.progress_percent ?? 0,
            time: fmtMMSS(c.progress_elapsed_seconds),
            errors: c.progress_error_count ?? 0,
            es: (c.progress_error_count ?? 0) > 1 ? 's' : '',
            hints: c.progress_hints_used ?? 0,
            hs: (c.progress_hints_used ?? 0) > 1 ? 's' : ''
          })}
        </span>
      </div>
    );
  }

  return <span className="defi-row-waiting">{t('defi_waiting')}</span>;
}

function ChallengeRow({ c, isSent, onDelete, deletingId, onExpand }) {
  const { t } = useT();
  const diffLabel = (d) => ({ facile: t('diff_facile'), moyen: t('diff_moyen'), complique: t('diff_complique'), enfer: t('diff_enfer') })[d] ?? d;

  return (
    <div className="defi-row" onClick={() => onExpand(c)} style={{ cursor: 'pointer' }}>
      <div className="defi-row-left">
        <span className="defi-row-opponent">
          {isSent ? (c.label || t('dd_sent_label')) : (c.sender_email || t('defi_a_friend'))}
        </span>
        <span className="defi-row-meta">
          {diffLabel(c.difficulty_mode)} · {fmtDate(c.created_at)}
        </span>
      </div>
      <div className="defi-row-right">
        <ChallengeStatus c={c} />
        <button
          className="defi-row-delete"
          onClick={e => { e.stopPropagation(); onDelete(c); }}
          disabled={deletingId === c.id}
          title={t('dd_delete_title')}
        >🗑</button>
      </div>
    </div>
  );
}

// Détail d'une ligne : montre la photo envoyée/reçue (tant qu'elle n'a pas
// été purgée — voir purgeExpiredChallenges) et le statut/résultat.
function ChallengeDetail({ c, isSent, onClose }) {
  const { t } = useT();
  const diffLabel = (d) => ({ facile: t('diff_facile'), moyen: t('diff_moyen'), complique: t('diff_complique'), enfer: t('diff_enfer') })[d] ?? d;
  const photoUrl = c.photo_path ? getSharedPhotoPublicUrl(c.photo_path) : null;

  return (
    <div className="defi-dash-overlay" onClick={onClose}>
      <div className="defi-dash-panel" onClick={e => e.stopPropagation()}>
        <div className="defi-dash-header">
          <h2>{isSent ? (c.label || t('dd_sent_label')) : (c.sender_email || t('defi_a_friend'))}</h2>
          <button className="defi-dash-close" onClick={onClose}>✕</button>
        </div>
        <p className="defi-row-meta">{diffLabel(c.difficulty_mode)} · {fmtDate(c.created_at)}</p>
        {photoUrl ? (
          <img src={photoUrl} alt="" className="challenge-photo-preview" />
        ) : (
          <p className="defi-dash-empty">{t('mem_no_photo')}</p>
        )}
        <ChallengeStatus c={c} />
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
  const [expanded, setExpanded] = useState(null); // { challenge, isSent } affiché en détail

  useEffect(() => {
    if (!userId) { setSent([]); setReceived([]); return; }
    let cancelled = false;
    const refresh = () => {
      fetchSentChallenges(userId).then(data => { if (!cancelled) setSent(data); }).catch(err => console.error('fetchSentChallenges failed:', err));
      fetchReceivedChallenges(userId).then(data => { if (!cancelled) setReceived(data); }).catch(err => console.error('fetchReceivedChallenges failed:', err));
    };
    // Nettoyage différé (défis terminés depuis plus de 7 jours), une seule
    // fois à l'ouverture — voir le commentaire dans lib/challenges.js.
    purgeExpiredChallenges(userId).finally(refresh);
    const intervalId = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(intervalId); };
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
                <ChallengeRow
                  key={c.id} c={c} isSent={isSent}
                  onDelete={handleDelete}
                  deletingId={deletingId}
                  onExpand={(challenge) => setExpanded({ challenge, isSent })}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {expanded && (
        <ChallengeDetail
          c={expanded.challenge}
          isSent={expanded.isSent}
          onClose={() => setExpanded(null)}
        />
      )}
    </div>
  );
}
