// src/components/PlatformStatsDashboard.jsx
// Tableau de bord "plateforme" réservé à l'admin (voir la garde
// session?.user?.email dans App.jsx, identique à celle du bouton
// [TEST] Complete grid) — comptes, activité, volumétrie, taille de la base.
// La véritable protection est côté base : get_platform_stats() (RPC,
// SECURITY DEFINER) revérifie l'identité de l'appelant et refuse toute
// autre personne, même en contournant complètement cette interface.
import { useEffect, useState } from 'react';
import { useT } from '../i18n/index.jsx';
import { supabase } from '../lib/supabaseClient';
import './KpiDashboard.css';
import './PlatformStatsDashboard.css';

// Limite de la base de données sur le plan gratuit Supabase (à ajuster si
// le plan change un jour) — sert uniquement à afficher une barre de
// progression indicative, pas une valeur lue depuis l'API Supabase.
const FREE_TIER_DB_LIMIT_BYTES = 500 * 1024 * 1024;

export default function PlatformStatsDashboard({ onClose }) {
  const { t } = useT();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase.rpc('get_platform_stats')
      .then(({ data, error: rpcError }) => {
        if (rpcError) throw rpcError;
        setStats(data);
      })
      .catch(err => setError(err.message || t('auth_error')));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dbPercent = stats
    ? Math.min(100, Math.round((stats.db_size_bytes / FREE_TIER_DB_LIMIT_BYTES) * 100))
    : 0;

  return (
    <div className="kpi-overlay" onClick={onClose}>
      <div className="kpi-panel" onClick={(e) => e.stopPropagation()}>
        <div className="kpi-header">
          <h2>{t('platform_stats_title')}</h2>
          <button className="kpi-close" onClick={onClose}>✕</button>
        </div>

        {error && <p className="kpi-error">{error}</p>}
        {!stats && !error && <p>{t('kpi_loading')}</p>}

        {stats && (
          <>
            <h3 className="kpi-section-title">{t('platform_stats_accounts')}</h3>
            <div className="kpi-grid">
              <div className="kpi-card">
                <span className="kpi-value">{stats.total_accounts}</span>
                <span className="kpi-label">{t('platform_stats_total_accounts')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{stats.new_accounts_today}</span>
                <span className="kpi-label">{t('platform_stats_new_today')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{stats.new_accounts_7d}</span>
                <span className="kpi-label">{t('platform_stats_new_7d')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{stats.accounts_with_username}</span>
                <span className="kpi-label">{t('platform_stats_with_username')}</span>
              </div>
            </div>

            <h3 className="kpi-section-title">{t('platform_stats_activity')}</h3>
            <div className="kpi-grid">
              <div className="kpi-card">
                <span className="kpi-value">{stats.distinct_authenticated_users_today}</span>
                <span className="kpi-label">{t('platform_stats_dau_auth')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{stats.distinct_authenticated_users_7d}</span>
                <span className="kpi-label">{t('platform_stats_wau_auth')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{stats.anonymous_game_starts_today}</span>
                <span className="kpi-label">{t('platform_stats_anon_starts')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{stats.game_events_today}</span>
                <span className="kpi-label">{t('platform_stats_events_today')}</span>
              </div>
            </div>
            <p className="platform-stats-note">{t('platform_stats_anon_note')}</p>

            <h3 className="kpi-section-title">{t('platform_stats_defis')}</h3>
            <div className="kpi-grid">
              <div className="kpi-card">
                <span className="kpi-value">{stats.total_challenges_sent}</span>
                <span className="kpi-label">{t('platform_stats_challenges_sent')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{stats.challenges_completed}</span>
                <span className="kpi-label">{t('platform_stats_challenges_done')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{stats.total_rematches_sent}</span>
                <span className="kpi-label">{t('platform_stats_rematches_sent')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{stats.rematches_completed}</span>
                <span className="kpi-label">{t('platform_stats_rematches_done')}</span>
              </div>
            </div>

            <h3 className="kpi-section-title">{t('platform_stats_storage')}</h3>
            <div className="platform-stats-storage">
              <div className="platform-stats-storage-bar">
                <div className="platform-stats-storage-fill" style={{ width: `${dbPercent}%` }} />
              </div>
              <p className="platform-stats-storage-label">
                {t('platform_stats_storage_used', { size: stats.db_size_pretty, percent: dbPercent })}
              </p>
              <p className="platform-stats-note">{t('platform_stats_storage_note')}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
