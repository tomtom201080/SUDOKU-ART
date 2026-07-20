import { useT, translate } from '../i18n/index.jsx';
// src/components/KpiDashboard.jsx
import { useEffect, useState } from 'react';
import { fetchAllGameEvents } from '../lib/analytics';
import { computeKpis } from '../utils/kpiStats';
import './KpiDashboard.css';

export default function KpiDashboard({ onClose }) {
  const { t } = useT();
  const DIFFICULTY_LABELS = {
    facile: t('diff_facile'),
    moyen: t('diff_moyen'),
    complique: t('diff_complique'),
    enfer: t('diff_enfer'),
  };
  const [kpis, setKpis] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllGameEvents()
      .then(events => setKpis(computeKpis(events)))
      .catch(err => setError(err.message || translate('auth_error')));
  }, []);

  return (
    <div className="kpi-overlay" onClick={onClose}>
      <div className="kpi-panel" onClick={(e) => e.stopPropagation()}>
        <div className="kpi-header">
          <h2>{t('_statistiques')}</h2>
          <button className="kpi-close" onClick={onClose}>✕</button>
        </div>

        {error && <p className="kpi-error">{error}</p>}

        {!kpis && !error && <p>{t('kpi_loading')}</p>}

        {kpis && (
          <>
            <div className="kpi-grid">
              <div className="kpi-card">
                <span className="kpi-value">{kpis.startedToday}</span>
                <span className="kpi-label">{t('kpi_started_today')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{kpis.completedToday}</span>
                <span className="kpi-label">{t('kpi_finished_today')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{kpis.totalStarted}</span>
                <span className="kpi-label">{t('kpi_total_started')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{kpis.totalCompleted}</span>
                <span className="kpi-label">{t('kpi_total_finished')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{kpis.globalCompletionRate != null ? `${kpis.globalCompletionRate}%` : '—'}</span>
                <span className="kpi-label">{t('kpi_completion')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{kpis.totalFailed}</span>
                <span className="kpi-label">{t('kpi_failed')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{kpis.avgErrors}</span>
                <span className="kpi-label">{translate('kpi_avg_errors')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{kpis.avgTime}</span>
                <span className="kpi-label">{translate('kpi_avg_time')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{kpis.customPhotoGames}</span>
                <span className="kpi-label">{t('kpi_with_photo')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{kpis.challengeGamesStarted}</span>
                <span className="kpi-label">{t('kpi_challenges')}</span>
              </div>
            </div>

            <h3 className="kpi-section-title">{t('kpi_by_diff')}</h3>
            <table className="kpi-table">
              <thead>
                <tr>
                  <th>{t('kpi_diff_col')}</th>
                  <th>{t('kpi_started_col')}</th>
                  <th>{t('kpi_finished_col')}</th>
                  <th>{t('kpi_rate_col')}</th>
                </tr>
              </thead>
              <tbody>
                {kpis.byDifficulty.map(row => (
                  <tr key={row.difficulty}>
                    <td>{DIFFICULTY_LABELS[row.difficulty]}</td>
                    <td>{row.started}</td>
                    <td>{row.completed}</td>
                    <td>{row.completionRate != null ? `${row.completionRate}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 className="kpi-section-title">{t('_7_derniers_jours')}</h3>
            <table className="kpi-table">
              <thead>
                <tr>
                  <th>{t('kpi_day_col')}</th>
                  <th>{t('kpi_started_col')}</th>
                  <th>{t('kpi_finished_col')}</th>
                </tr>
              </thead>
              <tbody>
                {kpis.last7Days.map(row => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>{row.started}</td>
                    <td>{row.completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
