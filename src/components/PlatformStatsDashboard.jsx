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
import { getSharedMediaPublicUrl, fetchReportedSharedMedia, adminDeleteSharedMedia } from '../lib/sharedMedia';
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
  const [reportedMedia, setReportedMedia] = useState(null);
  const [deletingMediaId, setDeletingMediaId] = useState(null);

  useEffect(() => {
    Promise.all([
      supabase.rpc('get_platform_stats'),
      supabase.rpc('get_shared_grids_stats'),
      supabase.rpc('get_shared_media_stats')
    ])
      .then(([platform, sharedGrids, sharedMedia]) => {
        if (platform.error) throw platform.error;
        if (sharedGrids.error) throw sharedGrids.error;
        if (sharedMedia.error) throw sharedMedia.error;
        setStats({ ...platform.data, sharedGrids: sharedGrids.data, sharedMedia: sharedMedia.data });
      })
      .catch(err => setError(err.message || t('auth_error')));

    fetchReportedSharedMedia().then(setReportedMedia).catch(() => setReportedMedia([]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteReported = async (id) => {
    setDeletingMediaId(id);
    try {
      await adminDeleteSharedMedia(id);
      setReportedMedia(prev => prev?.filter(m => m.id !== id) ?? prev);
    } catch (err) {
      console.error('adminDeleteSharedMedia failed:', err);
    } finally {
      setDeletingMediaId(null);
    }
  };

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

            <h3 className="kpi-section-title">{t('platform_stats_shared_grids')}</h3>
            <div className="kpi-grid">
              <div className="kpi-card">
                <span className="kpi-value">{stats.sharedGrids.total_initial}</span>
                <span className="kpi-label">{t('platform_stats_shared_initial')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{stats.sharedGrids.total_snapshot}</span>
                <span className="kpi-label">{t('platform_stats_shared_snapshot')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{stats.sharedGrids.total_scans}</span>
                <span className="kpi-label">{t('platform_stats_shared_scans')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{stats.sharedGrids.created_today}</span>
                <span className="kpi-label">{t('platform_stats_shared_today')}</span>
              </div>
            </div>

            <h3 className="kpi-section-title">{t('platform_stats_media')}</h3>
            <div className="kpi-grid">
              <div className="kpi-card">
                <span className="kpi-value">{stats.sharedMedia.total_photos}</span>
                <span className="kpi-label">{t('platform_stats_media_photos')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{stats.sharedMedia.total_videos}</span>
                <span className="kpi-label">{t('platform_stats_media_videos')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{stats.sharedMedia.videos_uploaded}</span>
                <span className="kpi-label">{t('platform_stats_media_uploaded')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{stats.sharedMedia.videos_youtube + stats.sharedMedia.videos_vimeo + stats.sharedMedia.videos_direct}</span>
                <span className="kpi-label">{t('platform_stats_media_linked')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{stats.sharedMedia.total_plays}</span>
                <span className="kpi-label">{t('platform_stats_media_plays')}</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-value">{stats.sharedMedia.total_reports}</span>
                <span className="kpi-label">{t('platform_stats_media_reports')}</span>
              </div>
            </div>

            {reportedMedia && reportedMedia.length > 0 && (
              <>
                <h3 className="kpi-section-title">{t('platform_stats_reported_title')}</h3>
                <div className="platform-stats-reported-list">
                  {reportedMedia.map(m => (
                    <div className="platform-stats-reported-row" key={m.id}>
                      <img src={getSharedMediaPublicUrl(m.poster_path)} alt="" />
                      <div className="platform-stats-reported-info">
                        <span>{m.type === 'video' ? '🎬' : '📷'} {t('platform_stats_reported_count', { n: m.report_count })}</span>
                        <span className="platform-stats-note">{new Date(m.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <button
                        className="kpi-close"
                        onClick={() => handleDeleteReported(m.id)}
                        disabled={deletingMediaId === m.id}
                        title={t('platform_stats_reported_delete')}
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

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
