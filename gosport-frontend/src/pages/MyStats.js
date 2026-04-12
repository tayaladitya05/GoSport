import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function MyStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the logged-in player's profile and their stats
    api.get('/players/me')
      .then(async (res) => {
        const player = res.data;
        if (player && player._id) {
          try {
            const s = await api.get(`/players/${player._id}/stats`);
            setStats(s.data);
          } catch (err) {
            console.error("Error fetching stats:", err);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching player profile:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;

  return (
    <div className="container page-fade" style={{ paddingTop: 36, paddingBottom: 60 }}>
      <h2 className="section-title" style={{ marginBottom: 4 }}>My Stats</h2>
      <p className="section-sub">Your career performance overview</p>

      {!stats ? (
        <div className="empty">
          <h3>No stats yet</h3>
          <p>Your stats will appear here after matches are recorded by an admin</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {stats.cricket?.matches > 0 && (
            <div className="card">
              <p style={{ color: 'var(--orange)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                🏏 Cricket Career
              </p>
              <div className="grid-3">
                <div className="stat-box"><div className="val">{stats.cricket.matches}</div><div className="lbl">Matches</div></div>
                <div className="stat-box"><div className="val">{stats.cricket.runs}</div><div className="lbl">Runs</div></div>
                <div className="stat-box"><div className="val">{stats.cricket.wickets}</div><div className="lbl">Wickets</div></div>
              </div>
            </div>
          )}
          {stats.football?.matches > 0 && (
            <div className="card">
              <p style={{ color: 'var(--orange)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                ⚽ Football Career
              </p>
              <div className="grid-3">
                <div className="stat-box"><div className="val">{stats.football.matches}</div><div className="lbl">Matches</div></div>
                <div className="stat-box"><div className="val">{stats.football.goals}</div><div className="lbl">Goals</div></div>
                <div className="stat-box"><div className="val">{stats.football.assists}</div><div className="lbl">Assists</div></div>
              </div>
            </div>
          )}
          {!stats.cricket?.matches && !stats.football?.matches && (
            <div className="empty"><h3>No stats yet</h3><p>Stats will appear after matches are played</p></div>
          )}
        </div>
      )}
    </div>
  );
}
