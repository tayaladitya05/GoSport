import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function StatCard({ val, label, color }) {
  return (
    <div className="stat-box">
      <div className="val" style={color ? { color } : {}}>{val}</div>
      <div className="lbl">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/matches')
      .then(r => { setMatches(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const live      = matches.filter(m => m.status === 'live');
  const upcoming  = matches.filter(m => m.status === 'upcoming');
  const completed = matches.filter(m => m.status === 'completed');
  const recent    = matches.slice(0, 5);

  return (
    <div className="container page-fade" style={{ paddingTop: 36, paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
          Welcome back
        </p>
        <h2 className="section-title" style={{ marginBottom: 6 }}>Dashboard</h2>
        <span style={{
          display: 'inline-block',
          background: 'var(--accent-glow)', color: 'var(--accent)',
          border: '1px solid var(--accent)', borderRadius: 20,
          padding: '3px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>{user?.role}</span>
      </div>

      {loading ? <div className="spinner" /> : (
        <>
          {/* Stats */}
          <div className="grid-3" style={{ marginBottom: 28 }}>
            <StatCard val={live.length}      label="Live Now"  color="var(--accent)" />
            <StatCard val={upcoming.length}  label="Upcoming"  color="var(--success)" />
            <StatCard val={completed.length} label="Completed" />
          </div>

          {/* Quick actions */}
          {user?.role === 'admin' && (
            <div className="card" style={{ marginBottom: 24 }}>
              <p className="label" style={{ marginBottom: 14 }}>Quick Actions</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link to="/matches/create" className="btn btn-primary">+ New Match</Link>
                <Link to="/register"       className="btn btn-secondary">+ Add Player</Link>
                <Link to="/players"        className="btn btn-secondary">All Players</Link>
                <Link to="/matches"        className="btn btn-secondary">All Matches</Link>
              </div>
            </div>
          )}

          {user?.role === 'player' && (
            <div className="card" style={{ marginBottom: 24 }}>
              <p className="label" style={{ marginBottom: 14 }}>Quick Actions</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link to="/matches"  className="btn btn-primary">View Matches</Link>
                <Link to="/my-stats" className="btn btn-secondary">My Stats</Link>
              </div>
            </div>
          )}

          {user?.role === 'spectator' && (
            <div className="card" style={{ marginBottom: 24 }}>
              <p className="label" style={{ marginBottom: 14 }}>Quick Actions</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link to="/matches" className="btn btn-primary">Live Scores</Link>
                <Link to="/players" className="btn btn-secondary">Player Stats</Link>
              </div>
            </div>
          )}

          {/* Recent matches */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ fontWeight: 700, fontSize: 15 }}>Recent Matches</p>
              <Link to="/matches" style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600 }}>View all →</Link>
            </div>
            {recent.length === 0 ? (
              <div className="empty"><h3>No matches yet</h3></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recent.map(m => (
                  <Link key={m._id} to={`/matches/${m._id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '13px 16px',
                      background: 'var(--card2)', borderRadius: 10,
                      border: '1px solid var(--border)', transition: 'border-color 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{m.matchName}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 3 }}>
                          {m.teams?.join(' vs ')} · {m.venue}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className={`badge badge-${m.sportType}`}>{m.sportType}</span>
                        <span className={`badge badge-${m.status}`}>
                          {m.status === 'live' && <span className="pulse" style={{ marginRight: 4 }} />}
                          {m.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
