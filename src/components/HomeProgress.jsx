// src/components/HomeProgress.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getUnlockedIds } from '../utils/storage';
import './HomeProgress.css';

export default function HomeProgress({ userId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Stats locales immédiates
    const local = getUnlockedIds();
    setStats({ unlocked: local.length, streak: null, totalCompleted: null });

    if (!userId) return;

    // Enrichissement depuis la base (streak + total parties gagnées)
    supabase
      .from('game_events')
      .select('event_type, created_at, difficulty')
      .eq('user_id', userId)
      .eq('event_type', 'complete')
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        if (!data) return;

        const totalCompleted = data.length;

        // Calcul du streak : jours consécutifs avec au moins 1 partie terminée
        const days = new Set(data.map(e => new Date(e.created_at).toDateString()));
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          if (days.has(d.toDateString())) streak++;
          else if (i > 0) break;
        }

        const local = getUnlockedIds();
        setStats({ unlocked: local.length, streak, totalCompleted });
      });
  }, [userId]);

  if (!stats) return null;

  return (
    <div className="home-progress">
      <div className="home-progress-stat">
        <span className="home-progress-value">{stats.unlocked}</span>
        <span className="home-progress-label">Tableaux<br/>débloqués</span>
      </div>
      {stats.totalCompleted !== null && (
        <div className="home-progress-stat">
          <span className="home-progress-value">{stats.totalCompleted}</span>
          <span className="home-progress-label">Parties<br/>gagnées</span>
        </div>
      )}
      {stats.streak !== null && stats.streak > 0 && (
        <div className="home-progress-stat">
          <span className="home-progress-value">🔥{stats.streak}</span>
          <span className="home-progress-label">Jours<br/>de suite</span>
        </div>
      )}
    </div>
  );
}
