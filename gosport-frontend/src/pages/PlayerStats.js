import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

export default function PlayerStats() {
  const { id } = useParams();
  const [stats,  setStats]  = useState(null);
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const BASE = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000/api`;
    Promise.all([
      api.get(`/players/${id}/stats`),
      // Change 5: use public endpoint to get player name & profile
      fetch(`${BASE}/public/players/${id}/skills`).then(r => r.json()),
    ]).then(([sRes, skillsRes]) => {
      setStats(sRes.data);
      // skillsRes.player has: displayName, sportType, teamName, role, jerseyNumber
      setPlayer(skillsRes?.player || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;

  return (
    <div className="container page-fade" style={{ paddingTop: 36, paddingBottom: 60 }}>
      <Link to="/players" style={{
        color: 'var(--text-muted)', fontSize: 13, fontWeight: 600,
        display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24,
      }}>← Back to Players</Link>

      {/* Player header card — Change 5: show name */}
      {player ? (
        <div className="card" style={{ marginBottom: 24, borderColor: 'var(--border2)' }}>
          <div style={{
            height: 3, borderRadius: '2px 2px 0 0',
            background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
            margin: '-24px -24px 24px',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            {/* Avatar circle showing jersey number */}
            <div style={{
              width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-head)', fontSize: '1.5rem', color: '#fff',
            }}>
              {player.jerseyNumber || '#'}
            </div>
            <div>
              {/* Change 5: Prominently show displayName */}
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', letterSpacing: '-0.01em', marginBottom: 8 }}>
                {player.displayName || 'Unknown Player'}
              </h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className={`badge badge-${player.sportType}`}>{player.sportType}</span>
                <span className="badge" style={{ background: 'var(--card2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  {player.teamName}
                </span>
                <span className="badge" style={{ background: 'var(--card2)', color: 'var(--text-muted)', border: '1px solid var(--border)', textTransform: 'capitalize' }}>
                  {player.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 24 }}>
          <p style={{ color: 'var(--text-muted)' }}>Player profile not found.</p>
        </div>
      )}

      {/* Stats */}
      {stats ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {stats.cricket?.matches > 0 && (
            <div className="card">
              <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
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
              <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
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
            <div className="empty">
              <h3>No stats yet</h3>
              <p>Stats appear here after matches are played and recorded by admin</p>
            </div>
          )}
        </div>
      ) : (
        <div className="empty"><h3>Could not load stats</h3></div>
      )}
    </div>
  );
}
