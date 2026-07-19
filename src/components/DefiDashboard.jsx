// src/components/DefiDashboard.jsx
import { useT } from '../i18n/index.jsx';
import { useEffect, useState } from 'react';
import {
  fetchSentRematches, fetchReceivedRematches,
  determineRematchWinner, calcAdjustedScore, formatAdjustedScore,
  fetchGroupResults, hideRematch, getHiddenRematchIds
} from '../lib/rematches';
import './DefiDashboard.css';

const DIFF_LABELS = { facile: 'Facile', moyen: 'Moyen', complique: 'Compliqué', enfer: 'Enfer' };

function fmt(s) {
  if (s == null) return '—';
  return `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// ─── Classement mode groupe ───────────────────────────────────────
function GroupLeaderboard({ rematch, onClose }) {
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchGroupResults(rematch.id).then(data => {
      // Ajouter l'expéditeur (challenger) s'il a joué
      const rows = [...data];
      if (rematch.challenger_result_seconds > 0) {
        rows.unshift({
          id: 'challenger',
          player_name: rematch.challenger_name || 'Toi (expéditeur)',
          errors: rematch.challenger_result_errors ?? 0,
          seconds: rematch.challenger_result_seconds ?? 0,
          hints: rematch.challenger_result_hints ?? 0,
          isChallenger: true,
        });
      }
      // Trier par score ajusté
      rows.sort((a, b) =>
        calcAdjustedScore({ seconds: a.seconds, errors: a.errors, hints: a.hints ?? 0 }) -
        calcAdjustedScore({ seconds: b.seconds, errors: b.errors, hints: b.hints ?? 0 })
      );
      setResults(rows);
    });
  }, [rematch.id]);

  return (
    <div className="group-leaderboard-overlay" onClick={onClose}>
      <div className="group-leaderboard-panel" onClick={e => e.stopPropagation()}>
        <div className="group-leaderboard-header">
          <h3>🏆 Classement</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <p className="group-leaderboard-meta">
          {DIFF_LABELS[rematch.difficulty] ?? rematch.difficulty} · {fmtDate(rematch.created_at)}
          {rematch.hints_limit != null && ` · Max ${rematch.hints_limit} indice${rematch.hints_limit > 1 ? 's' : ''}`}
        </p>

        {results === null && <p className="defi-dash-empty">Chargement…</p>}
        {results?.length === 0 && <p className="defi-dash-empty">Personne n'a encore joué.</p>}
        {results?.map((r, i) => {
          const score = calcAdjustedScore({ seconds: r.seconds, errors: r.errors, hints: r.hints ?? 0 });
          const medals = ['🥇', '🥈', '🥉'];
          return (
            <div key={r.id} className={`group-result-row ${r.isChallenger ? 'is-challenger' : ''}`}>
              <span className="group-rank">{medals[i] ?? `${i+1}.`}</span>
              <span className="group-name">{r.player_name}</span>
              <div className="group-stats">
                <span>❌ {r.errors}</span>
                <span>💡 {r.hints ?? 0}</span>
                <span>⏱ {fmt(r.seconds)}</span>
                <span className="group-score">🏁 {formatAdjustedScore(score)}</span>
              </div>
            </div>
          );
        })}

        <p className="rematch-scoring-note">⏱ +2 min par erreur · 💡 +2 min par indice</p>
      </div>
    </div>
  );
}

// ─── Résultat mode perso (1v1) ────────────────────────────────────
function PersonalResult({ r, isSent }) {
  const w = determineRematchWinner({
    challengerErrors: r.challenger_result_errors,
    challengerSeconds: r.challenger_result_seconds,
    challengerHints: r.challenger_result_hints ?? 0,
    recipientErrors: r.recipient_result_errors,
    recipientSeconds: r.recipient_result_seconds,
    recipientHints: r.recipient_result_hints ?? 0,
  });
  const iWon = (isSent && w === 'challenger') || (!isSent && w === 'recipient');
  const tie  = w === 'tie';

  return (
    <div className={`defi-result-badge ${iWon ? 'won' : tie ? 'tie' : 'lost'}`}>
      {iWon ? 'Gagné 🏆' : tie ? 'Égalité 🤝' : 'Perdu'}
    </div>
  );
}

// ─── Ligne de défi ───────────────────────────────────────────────
function RematchRow({ r, isSent, onHide, onExpand }) {
  const opponent = isSent
    ? (r.challenger_name ? `Tu as défié` : 'Défi envoyé')
    : (r.challenger_name || 'Un ami');

  const isGroup    = !!r.group_mode;
  const hasPlayed  = r.completed || (isGroup && r.challenger_result_seconds > 0);

  return (
    <div className="defi-row" onClick={() => hasPlayed && onExpand(r)} style={{ cursor: hasPlayed ? 'pointer' : 'default' }}>
      <div className="defi-row-left">
        <span className="defi-row-opponent">
          {isGroup ? '👨‍👩‍👧 ' : ''}{isSent ? (r.challenger_name ? `Envoyé par ${r.challenger_name}` : 'Défi envoyé') : (r.challenger_name || 'Un ami')}
        </span>
        <span className="defi-row-meta">
          {DIFF_LABELS[r.difficulty] ?? r.difficulty} · {fmtDate(r.created_at)}
          {hasPlayed && ' · Voir résultats →'}
        </span>
      </div>
      <div className="defi-row-right">
        {!hasPlayed && <span className="defi-row-waiting">En attente</span>}
        {hasPlayed && !isGroup && <PersonalResult r={r} isSent={isSent} />}
        {hasPlayed && isGroup && <span className="defi-badge defi-badge-pending">Groupe</span>}
        <button
          className="defi-row-delete"
          onClick={e => { e.stopPropagation(); onHide(r.id); }}
          title="Supprimer"
        >🗑</button>
      </div>
    </div>
  );
}

// ─── Dashboard principal ─────────────────────────────────────────
export default function DefiDashboard({ userId, onClose, onCreateDefi }) {
  const { t } = useT();
  const [tab, setTab]         = useState('sent');
  const [sent, setSent]       = useState(null);
  const [received, setReceived] = useState(null);
  const [hidden, setHidden]   = useState(() => getHiddenRematchIds(userId));
  const [expanded, setExpanded] = useState(null); // rematch affiché en détail

  useEffect(() => {
    fetchSentRematches(userId).then(setSent);
    fetchReceivedRematches(userId).then(setReceived);
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
              onExpand={setExpanded}
            />
          ))}
        </div>
      </div>

      {expanded && (
        <GroupLeaderboard rematch={expanded} onClose={() => setExpanded(null)} />
      )}
    </div>
  );
}
