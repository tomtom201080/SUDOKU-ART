// src/components/DefiDashboard.jsx
import { useEffect, useState } from 'react';
import { fetchSentRematches, fetchReceivedRematches, determineRematchWinner } from '../lib/rematches';
import './DefiDashboard.css';

const DIFF_LABELS = { facile: 'Facile', moyen: 'Moyen', complique: 'Compliqué', enfer: 'Enfer' };

function formatTime(s) {
  if (!s && s !== 0) return '—';
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function StatusBadge({ r, isSent }) {
  if (!r.completed) {
    return <span className="defi-badge defi-badge-pending">En attente</span>;
  }
  if (isSent) {
    const w = determineRematchWinner({
      challengerErrors: r.challenger_result_errors,
      challengerSeconds: r.challenger_result_seconds,
      recipientErrors: r.recipient_result_errors,
      recipientSeconds: r.recipient_result_seconds,
    });
    if (w === 'challenger') return <span className="defi-badge defi-badge-win">Gagné 🏆</span>;
    if (w === 'recipient') return <span className="defi-badge defi-badge-lose">Perdu</span>;
    return <span className="defi-badge defi-badge-tie">Égalité</span>;
  } else {
    const w = determineRematchWinner({
      challengerErrors: r.challenger_result_errors,
      challengerSeconds: r.challenger_result_seconds,
      recipientErrors: r.recipient_result_errors,
      recipientSeconds: r.recipient_result_seconds,
    });
    if (w === 'recipient') return <span className="defi-badge defi-badge-win">Gagné 🏆</span>;
    if (w === 'challenger') return <span className="defi-badge defi-badge-lose">Perdu</span>;
    return <span className="defi-badge defi-badge-tie">Égalité</span>;
  }
}

function RematchRow({ r, isSent }) {
  const opponent = isSent
    ? (r.recipient_user_id ? 'Ami connecté' : 'Ami')
    : (r.challenger_name || 'Ami');

  const myErrors   = isSent ? r.challenger_result_errors  : r.recipient_result_errors;
  const mySeconds  = isSent ? r.challenger_result_seconds : r.recipient_result_seconds;
  const theirErrors  = isSent ? r.recipient_result_errors  : r.challenger_result_errors;
  const theirSeconds = isSent ? r.recipient_result_seconds : r.challenger_result_seconds;

  return (
    <div className="defi-row">
      <div className="defi-row-left">
        <span className="defi-row-opponent">{opponent}</span>
        <span className="defi-row-meta">{DIFF_LABELS[r.difficulty] ?? r.difficulty} · {formatDate(r.created_at)}</span>
      </div>
      <div className="defi-row-right">
        {r.completed ? (
          <div className="defi-row-scores">
            <span className="defi-score-me">Moi : {myErrors}❌ {formatTime(mySeconds)}</span>
            <span className="defi-score-them">{opponent} : {theirErrors ?? '—'}❌ {formatTime(theirSeconds)}</span>
          </div>
        ) : (
          <span className="defi-row-waiting">Pas encore joué</span>
        )}
        <StatusBadge r={r} isSent={isSent} />
      </div>
    </div>
  );
}

export default function DefiDashboard({ userId, onClose, onCreateDefi }) {
  const [tab, setTab] = useState('sent'); // 'sent' | 'received'
  const [sent, setSent] = useState(null);
  const [received, setReceived] = useState(null);

  useEffect(() => {
    fetchSentRematches(userId).then(setSent);
    fetchReceivedRematches(userId).then(setReceived);
  }, [userId]);

  const list = tab === 'sent' ? sent : received;
  const isSent = tab === 'sent';

  return (
    <div className="defi-dash-overlay">
      <div className="defi-dash-panel">
        <div className="defi-dash-header">
          <h2>🎯 Mes défis</h2>
          <button className="defi-dash-close" onClick={onClose}>✕</button>
        </div>

        <button className="defi-dash-create" onClick={onCreateDefi}>
          ➕ Créer un nouveau défi
        </button>

        <div className="defi-dash-tabs">
          <button
            className={`defi-tab ${tab === 'sent' ? 'is-active' : ''}`}
            onClick={() => setTab('sent')}
          >
            Envoyés {sent && `(${sent.length})`}
          </button>
          <button
            className={`defi-tab ${tab === 'received' ? 'is-active' : ''}`}
            onClick={() => setTab('received')}
          >
            Reçus {received && `(${received.length})`}
          </button>
        </div>

        <div className="defi-dash-list">
          {list === null && <p className="defi-dash-empty">Chargement…</p>}
          {list?.length === 0 && (
            <p className="defi-dash-empty">
              {isSent ? 'Tu n\'as pas encore envoyé de défi.' : 'Tu n\'as pas encore reçu de défi.'}
            </p>
          )}
          {list?.map(r => (
            <RematchRow key={r.id} r={r} isSent={isSent} />
          ))}
        </div>
      </div>
    </div>
  );
}
