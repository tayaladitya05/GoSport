import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Players() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    // Fetch players list; also fetch public skills to get player names
    // The /api/players endpoint returns player docs; we also hit /api/public/players/:id/skills
    // to get displayName. We'll do a combined fetch.
    const BASE = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000/api`;

    api.get('/players').then(async (res) => {
      const rawPlayers = res.data;

      // Change 5: Enrich each player with their displayName from public skills API
      const enriched = await Promise.all(
        rawPlayers.map(async (p) => {
          try {
            const r = await fetch(`${BASE}/public/players/${p._id}/skills`);
            const data = await r.json();
            return { ...p, displayName: data?.player?.displayName || null };
          } catch {
            return { ...p, displayName: null };
          }
        })
      );
      setPlayers(enriched);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? players : players.filter(p => p.sportType === filter);

  const isAdminOrPlayer = user?.role === 'admin' || user?.role === 'player';

  return (
    <div className="container page-fade" style={{ paddingTop: 36, paddingBottom: 60 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Players</h2>
          <p className="section-sub" style={{ marginBottom: 0 }}>
            {players.length} registered players
          </p>
        </div>
        {/* Change 3: Only admin can add new players */}
        {user?.role === 'admin' && (
          <Link to="/register" className="btn btn-primary">+ Add Player</Link>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'cricket', 'football'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 18px', borderRadius: 20, cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
            background: filter === f ? 'var(--accent)' : 'var(--card2)',
            color:      filter === f ? '#fff' : 'var(--text-muted)',
            border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`,
            textTransform: 'capitalize', transition: 'all 0.15s',
          }}>{f}</button>
        ))}
      </div>

      {loading ? <div className="spinner" /> : filtered.length === 0 ? (
        <div className="empty"><h3>No players found</h3></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {/* Change 5: show "Player Name" instead of "Player ID" */}
                <th>Player Name</th>
                <th>Sport</th>
                <th>Team</th>
                <th>Role</th>
                <th>Jersey</th>
                <th>Stats</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  {/* Change 5: show actual name, fall back gracefully */}
                  <td style={{ fontWeight: 600 }}>
                    {p.displayName || (
                      <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Unknown</span>
                    )}
                  </td>
                  <td><span className={`badge badge-${p.sportType}`}>{p.sportType}</span></td>
                  <td>{p.teamName}</td>
                  <td style={{ textTransform: 'capitalize' }}>{p.role}</td>
                  <td>{p.jerseyNumber || '—'}</td>
                  <td>
                    {/* Change 4: spectators can also view stats */}
                    <Link to={`/players/${p._id}/stats`}
                      style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600 }}>
                      View Stats →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
