// src/components/DefiDashboard.jsx
import { useT } from '../i18n/index.jsx';
import { useEffect, useState } from 'react';
import {
  fetchSentRematches, fetchReceivedRematches,
  determineRematchWinner,
  fetchGroupResults, fetchGroupInProgressParticipants, fetchGroupProgressSummary,
  hideRematch, getHiddenRematchIds
} from '../lib/rematches';
import RematchResultDetail from './RematchResultDetail';
import GroupResultsList from './GroupResultsList';
import './DefiDashboard.css';

// DIFF_LABELS dynamiques via useT()

// Rafraîchissement périodique pendant que le tableau (ou le détail groupe)
// reste ouvert, pour que le statut "en cours" avance sans refermer/rouvrir.
const REFRESH_INTERVAL_MS = 15000;

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function fmtMMSS(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds ?? 0));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function progressSummaryArgs(t, p) {
  return t('progress_summary', {
    percent: p.percent ?? 0,
    time: fmtMMSS(p.elapsedSeconds),
    errors: p.errorCount ?? 0,
    es: (p.errorCount ?? 0) > 1 ? 's' : '',
    hints: p.hintsUsed ?? 0,
    hs: (p.hintsUsed ?? 0) > 1 ? 's' : ''
  });
}

// ─── Participants en cours (détail groupe) ────────────────────────
function GroupInProgressList({ participants }) {
  const { t } = useT();
  if (!participants || participants.length === 0) return null;

  return (
    <div className="group-in-progress-list">
      <p className="group-in-progress-title">{t('status_in_progress')}</p>
      {participants.map(p => (
        <div key={p.id} className="group-result-row">
          <span className="group-name">{p.player_name}</span>
          <span className="defi-row-meta">
            {progressSummaryArgs(t, {
              percent: p.progress_percent,
              elapsedSeconds: p.progress_elapsed_seconds,
              errorCount: p.progress_error_count,
              hintsUsed: p.progress_hints_used
            })}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Classement mode groupe ───────────────────────────────────────
function GroupLeaderboard({ rematch, onClose }) {
  const { t } = useT();
  const [results, setResults] = useState(null);
  const [inProgress, setInProgress] = useState(null);
  const diffLabel = (d) => ({ facile: t('diff_facile'), moyen: t('diff_moyen'), complique: t('diff_complique'), enfer: t('diff_enfer') })[d] ?? d;
  const hintsSuffix = rematch.hints_limit != null ? t('dd_hints_limit_suffix', { n: rematch.hints_limit, s: rematch.hints_limit > 1 ? 's' : '' }) : '';

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      fetchGroupResults(rematch.id).then(data => { if (!cancelled) setResults(data); });
      fetchGroupInProgressParticipants(rematch.id).then(data => { if (!cancelled) setInProgress(data); });
    };
    refresh();
    const intervalId = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(intervalId); };
  }, [rematch.id]);

  return (
    <div className="group-leaderboard-overlay" onClick={onClose}>
      <div className="group-leaderboard-panel" onClick={e => e.stopPropagation()}>
        <div className="group-leaderboard-header">
          <h3>{t('dd_leaderboard_title')}</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <p className="group-leaderboard-meta">
          {diffLabel(rematch.difficulty) ?? rematch.difficulty} · {fmtDate(rematch.created_at)}{hintsSuffix}
        </p>

        <GroupInProgressList participants={inProgress} />
        <GroupResultsList rematch={rematch} results={results} />

        <p className="rematch-scoring-note">{t('dd_scoring')}</p>
      </div>
    </div>
  );
}

// ─── Résultat mode perso (1v1) ────────────────────────────────────
function PersonalResult({ r, isSent }) {
  const { t } = useT();
  const w = determineRematchWinner({
    challengerErrors: r.challenger_result_errors,
    challengerSeconds: r.challenger_result_seconds,
    challengerHints: r.challenger_result_hints ?? 0,
    recipientErrors: r.recipient_result_errors,
    recipientSeconds: r.recipient_result_seconds,
    recipientHints: r.recipient_result_hints ?? 0 });
  const iWon = (isSent && w === 'challenger') || (!isSent && w === 'recipient');
  const tie  = w === 'tie';

  return (
    <div className={`defi-result-badge ${iWon ? 'won' : tie ? 'tie' : 'lost'}`}>
      {iWon ? t('dd_won') : tie ? t('dd_tie') : t('dd_lost')}
    </div>
  );
}

// Statut "en cours" du destinataire, mode perso — synthèse %, temps,
// erreurs, indices, poussée périodiquement pendant sa partie (useGame.js).
function PersonalProgress({ r }) {
  const { t } = useT();
  return (
    <div className="defi-row-progress">
      <span className="defi-badge defi-badge-pending">{t('status_in_progress')}</span>
      <span className="defi-row-meta">
        {progressSummaryArgs(t, {
          percent: r.recipient_progress_percent,
          elapsedSeconds: r.recipient_progress_elapsed_seconds,
          errorCount: r.recipient_progress_error_count,
          hintsUsed: r.recipient_progress_hints_used
        })}
      </span>
    </div>
  );
}

// Résumé agrégé mode groupe, sur la ligne générique — combien de
// participants sont en cours, combien ont déjà joué. Chargé séparément
// (léger, pas inclus dans le select principal), rafraîchi périodiquement.
function GroupRowStatus({ rematchId }) {
  const { t } = useT();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const refresh = () => fetchGroupProgressSummary(rematchId).then(s => { if (!cancelled) setSummary(s); });
    refresh();
    const intervalId = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(intervalId); };
  }, [rematchId]);

  if (!summary || (summary.inProgress === 0 && summary.played === 0)) {
    return <span className="defi-badge defi-badge-pending">{t('dd_group_badge')}</span>;
  }
  return (
    <span className="defi-badge defi-badge-pending">
      {t('dd_group_status', { inProgress: summary.inProgress, played: summary.played, ps: summary.played > 1 ? 's' : '' })}
    </span>
  );
}

// ─── Ligne de défi ───────────────────────────────────────────────
function RematchRow({ r, isSent, onHide, onExpand, onRegenerate }) {
  const { t } = useT();
  const diffLabel = (d) => ({ facile: t('diff_facile'), moyen: t('diff_moyen'), complique: t('diff_complique'), enfer: t('diff_enfer') })[d] ?? d;

  const isGroup    = !!r.group_mode;
  // En mode groupe, le classement (rematch_results) peut contenir des
  // résultats même quand challenger_result_seconds est resté à 0 (défi créé
  // sans avoir joué au préalable, cas normal du bouton "Défi" de l'accueil).
  // Impossible de savoir sans requête séparée si quelqu'un a déjà joué, donc
  // on laisse toujours la ligne cliquable en mode groupe : le classement
  // affiche lui-même proprement "personne n'a encore joué" le cas échéant.
  const hasPlayed  = isGroup || r.completed;
  const inProgress = !isGroup && !hasPlayed && !!r.recipient_started_at;

  return (
    <div className="defi-row" onClick={() => hasPlayed && onExpand(r)} style={{ cursor: hasPlayed ? 'pointer' : 'default' }}>
      <div className="defi-row-left">
        <span className="defi-row-opponent">
          {/* Envoyé : "envoyé par X" n'apporte rien (X, c'est toujours soi-même)
              — on affiche plutôt le nom donné au défi, ou un libellé neutre. */}
          {isGroup ? '👨‍👩‍👧 ' : ''}{isSent ? (r.label || t('dd_sent_label')) : (r.challenger_name || t('defi_a_friend'))}
        </span>
        <span className="defi-row-meta">
          {diffLabel(r.difficulty) ?? r.difficulty} · {fmtDate(r.created_at)}
          {hasPlayed && ` · ${t('dd_results_arrow')}`}
        </span>
      </div>
      <div className="defi-row-right">
        {!isGroup && !hasPlayed && (inProgress ? <PersonalProgress r={r} /> : <span className="defi-row-waiting">{t('defi_waiting')}</span>)}
        {hasPlayed && !isGroup && <PersonalResult r={r} isSent={isSent} />}
        {isGroup && <GroupRowStatus rematchId={r.id} />}
        {isSent && onRegenerate && (
          <button
            className="defi-row-resend"
            onClick={e => { e.stopPropagation(); onRegenerate(r); }}
            title={t('dd_resend_title')}
          >🔄</button>
        )}
        <button
          className="defi-row-delete"
          onClick={e => { e.stopPropagation(); onHide(r.id); }}
          title={t('dd_delete_title')}
        >🗑</button>
      </div>
    </div>
  );
}

// ─── Dashboard principal ─────────────────────────────────────────
export default function DefiDashboard({ userId, onClose, onCreateDefi, onRegenerateDefi }) {
  const { t } = useT();
  const [tab, setTab]         = useState('sent');
  const [sent, setSent]       = useState(null);
  const [received, setReceived] = useState(null);
  const [hidden, setHidden]   = useState(() => getHiddenRematchIds(userId));
  const [expanded, setExpanded] = useState(null); // { rematch, isSent } affiché en détail

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      fetchSentRematches(userId).then(data => { if (!cancelled) setSent(data); });
      fetchReceivedRematches(userId).then(data => { if (!cancelled) setReceived(data); });
    };
    refresh();
    const intervalId = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(intervalId); };
  }, [userId]);

  const handleHide = (id) => {
    hideRematch(id, userId);
    setHidden(prev => [...prev, id]);
  };

  const isSent  = tab === 'sent';
  const rawList = isSent ? sent : received;
  const list    = rawList?.filter(r => !hidden.includes(r.id)) ?? null;

  return (
    <div className="defi-dash-overlay">
      <div className="defi-dash-panel">
        <div className="defi-dash-header">
          <h2>{t('defi_dash_title')}</h2>
          <button className="defi-dash-close" onClick={onClose}>✕</button>
        </div>

        <button className="defi-dash-create" onClick={onCreateDefi}>
          {t('defi_dash_create')}
        </button>

        <div className="defi-dash-tabs">
          <button className={`defi-tab ${tab === 'sent' ? 'is-active' : ''}`} onClick={() => setTab('sent')}>
            {t('defi_tab_sent')} {sent && `(${sent.filter(r => !hidden.includes(r.id)).length})`}
          </button>
          <button className={`defi-tab ${tab === 'received' ? 'is-active' : ''}`} onClick={() => setTab('received')}>
            {t('defi_tab_received')} {received && `(${received.filter(r => !hidden.includes(r.id)).length})`}
          </button>
        </div>

        <div className="defi-dash-list">
          {list === null && <p className="defi-dash-empty">{t('defi_loading')}</p>}
          {list?.length === 0 && (
            <p className="defi-dash-empty">{isSent ? t('defi_empty_sent') : t('defi_empty_received')}</p>
          )}
          {list?.map(r => (
            <RematchRow
              key={r.id} r={r} isSent={isSent}
              onHide={handleHide}
              onExpand={(rematch) => setExpanded({ rematch, isSent })}
              onRegenerate={onRegenerateDefi}
            />
          ))}
        </div>
      </div>

      {expanded && (expanded.rematch.group_mode ? (
        <GroupLeaderboard rematch={expanded.rematch} onClose={() => setExpanded(null)} />
      ) : (
        <RematchResultDetail
          rematch={expanded.rematch}
          isSent={expanded.isSent}
          winner={determineRematchWinner({
            challengerErrors: expanded.rematch.challenger_result_errors,
            challengerSeconds: expanded.rematch.challenger_result_seconds,
            challengerHints: expanded.rematch.challenger_result_hints ?? 0,
            recipientErrors: expanded.rematch.recipient_result_errors,
            recipientSeconds: expanded.rematch.recipient_result_seconds,
            recipientHints: expanded.rematch.recipient_result_hints ?? 0
          })}
          onClose={() => setExpanded(null)}
        />
      ))}
    </div>
  );
}
