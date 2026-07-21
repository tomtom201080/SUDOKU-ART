// src/components/GroupResultsList.jsx
// Liste de classement d'un défi de groupe : challenger + participants,
// triés par score ajusté. Partagé entre "Mes défis envoyés" (GroupLeaderboard)
// et l'écran de fin de défi (WinModal).
import { useT } from '../i18n/index.jsx';
import { calcAdjustedScore, formatAdjustedScore, mergeAndSortGroupResults } from '../lib/rematches';

function fmt(s) {
  if (s == null) return '—';
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function GroupResultsList({ rematch, results, isMe }) {
  const { t } = useT();

  if (results === null) return <p className="defi-dash-empty">{t('defi_loading')}</p>;

  const rows = mergeAndSortGroupResults(rematch, results);
  const onlyMe = isMe && rows.length > 0 && rows.every(isMe);

  if (rows.length === 0) {
    return <p className="defi-dash-empty">{t('dd_no_results')}</p>;
  }
  if (onlyMe) {
    return <p className="defi-dash-empty">{t('group_waiting_first')}</p>;
  }

  return (
    <div className="group-results-list">
      {rows.map((r, i) => {
        const score = calcAdjustedScore({ seconds: r.seconds, errors: r.errors, hints: r.hints ?? 0 });
        const name = r.isChallenger ? (r.player_name || t('dd_sender_label')) : r.player_name;
        const mine = isMe?.(r);
        return (
          <div key={r.id} className={`group-result-row ${r.isChallenger ? 'is-challenger' : ''} ${mine ? 'is-me' : ''}`}>
            <span className="group-rank">{MEDALS[i] ?? `${i + 1}.`}</span>
            <span className="group-name">{name}{mine ? ` (${t('group_results_me')})` : ''}</span>
            <div className="group-stats">
              <span>❌ {r.errors}</span>
              <span>💡 {r.hints ?? 0}</span>
              <span>⏱ {fmt(r.seconds)}</span>
              <span className="group-score">🏁 {formatAdjustedScore(score)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
