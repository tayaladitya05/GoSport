import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Players() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api
      .get('/players')
      .then((res) => {
        setPlayers(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cricketPlayers = players.filter((p) => p.sportType === 'cricket');
  const footballPlayers = players.filter((p) => p.sportType === 'football');

  const showCricket = filter === 'all' || filter === 'cricket';
  const showFootball = filter === 'all' || filter === 'football';

  const getPlayerName = (p) => p.user?.name || p.displayName || 'Unknown Player';

  return (
    <div className="container page-fade" style={{ paddingTop: 36, paddingBottom: 60 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Players</h2>
          <p className="section-sub" style={{ marginBottom: 0 }}>
            {players.length} registered players across sports
          </p>
        </div>
        {user?.role === 'admin' && (
          <Link to="/register" className="btn btn-primary">+ Add Player</Link>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { id: 'all', label: `All (${players.length})` },
          { id: 'cricket', label: `Cricket (${cricketPlayers.length})` },
          { id: 'football', label: `Football (${footballPlayers.length})` },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '6px 18px',
              borderRadius: 20,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontWeight: 600,
              background: filter === f.id ? 'var(--orange)' : 'var(--card2)',
              color: filter === f.id ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${filter === f.id ? 'var(--orange)' : 'var(--border)'}`,
              transition: 'all 0.15s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner" />
      ) : players.length === 0 ? (
        <div className="empty">
          <h3>No players found</h3>
          <p>No players have been registered yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {/* Cricket Section */}
          {showCricket && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 20 }}>🏏</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-head)' }}>
                  Cricket Players
                </h3>
                <span className="badge badge-cricket" style={{ marginLeft: 4 }}>
                  {cricketPlayers.length}
                </span>
              </div>

              {cricketPlayers.length === 0 ? (
                <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No cricket players registered yet.
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Player Name</th>
                        <th>Team</th>
                        <th>Role</th>
                        <th>Jersey</th>
                        <th style={{ textAlign: 'center' }}>Matches</th>
                        <th style={{ textAlign: 'center' }}>Runs</th>
                        <th style={{ textAlign: 'center' }}>4s</th>
                        <th style={{ textAlign: 'center' }}>6s</th>
                        <th style={{ textAlign: 'center' }}>Wickets</th>
                        <th style={{ textAlign: 'center' }}>Overs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cricketPlayers.map((p) => (
                        <tr key={p._id}>
                          <td style={{ fontWeight: 600 }}>{getPlayerName(p)}</td>
                          <td>{p.teamName}</td>
                          <td style={{ textTransform: 'capitalize' }}>{p.role}</td>
                          <td>{p.jerseyNumber != null ? `#${p.jerseyNumber}` : '—'}</td>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{p.stats?.matches ?? 0}</td>
                          <td style={{ textAlign: 'center', color: 'var(--orange)', fontWeight: 700 }}>
                            {p.stats?.runs ?? 0}
                          </td>
                          <td style={{ textAlign: 'center' }}>{p.stats?.fours ?? 0}</td>
                          <td style={{ textAlign: 'center' }}>{p.stats?.sixes ?? 0}</td>
                          <td style={{ textAlign: 'center', color: 'var(--orange)', fontWeight: 700 }}>
                            {p.stats?.wickets ?? 0}
                          </td>
                          <td style={{ textAlign: 'center' }}>{p.stats?.overs ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Football Section */}
          {showFootball && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 20 }}>⚽</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-head)' }}>
                  Football Players
                </h3>
                <span className="badge badge-football" style={{ marginLeft: 4 }}>
                  {footballPlayers.length}
                </span>
              </div>

              {footballPlayers.length === 0 ? (
                <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No football players registered yet.
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Player Name</th>
                        <th>Team</th>
                        <th>Role</th>
                        <th>Jersey</th>
                        <th style={{ textAlign: 'center' }}>Matches</th>
                        <th style={{ textAlign: 'center' }}>Goals</th>
                        <th style={{ textAlign: 'center' }}>Assists</th>
                        <th style={{ textAlign: 'center' }}>Yellow Cards</th>
                        <th style={{ textAlign: 'center' }}>Red Cards</th>
                        <th style={{ textAlign: 'center' }}>Minutes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {footballPlayers.map((p) => (
                        <tr key={p._id}>
                          <td style={{ fontWeight: 600 }}>{getPlayerName(p)}</td>
                          <td>{p.teamName}</td>
                          <td style={{ textTransform: 'capitalize' }}>{p.role}</td>
                          <td>{p.jerseyNumber != null ? `#${p.jerseyNumber}` : '—'}</td>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{p.stats?.matches ?? 0}</td>
                          <td style={{ textAlign: 'center', color: 'var(--orange)', fontWeight: 700 }}>
                            {p.stats?.goals ?? 0}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{p.stats?.assists ?? 0}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ color: (p.stats?.yellowCards ?? 0) > 0 ? '#eab308' : 'inherit', fontWeight: 600 }}>
                              {p.stats?.yellowCards ?? 0}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ color: (p.stats?.redCards ?? 0) > 0 ? '#ef4444' : 'inherit', fontWeight: 600 }}>
                              {p.stats?.redCards ?? 0}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>{p.stats?.minutesPlayed ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
