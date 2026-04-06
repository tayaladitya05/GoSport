import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/matches').then(r => { setMatches(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? matches : matches.filter(m => m.status === filter);

  return (
    <div className="container page-fade" style={{ paddingTop: 36, paddingBottom: 60 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Matches</h2>
          <p className="section-sub" style={{ marginBottom: 0 }}>{matches.length} total matches</p>
        </div>
        {user?.role === 'admin' && (
          <Link to="/matches/create" className="btn btn-primary">+ Create Match</Link>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'live', 'upcoming', 'completed'].map(f => (
          <button
            key={f} onClick={() => setFilter(f)}
            style={{
              padding: '7px 18px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              background: filter === f ? 'var(--orange)' : 'var(--card2)',
              color: filter === f ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${filter === f ? 'var(--orange)' : 'var(--border)'}`,
              transition: 'all 0.15s', textTransform: 'capitalize',
            }}
          >{f}</button>
        ))}
      </div>

      {loading ? <div className="spinner" /> : filtered.length === 0 ? (
        <div className="empty"><h3>No matches found</h3><p>Try a different filter or create a match</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(m => (
            <Link key={m._id} to={`/matches/${m._id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ transition: 'border-color 0.15s, transform 0.15s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontWeight: 700, fontSize: 16 }}>{m.matchName}</h3>
                      <span className={`badge badge-${m.sportType}`}>{m.sportType}</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 4 }}>
                      {m.teams?.join(' vs ')}
                    </p>
                    <p style={{ color: 'var(--text-dim)', fontSize: 12 }}>
                      📍 {m.venue} · 📅 {new Date(m.matchDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <span className={`badge badge-${m.status}`}>
                      {m.status === 'live' && <span className="pulse" style={{ marginRight: 4 }} />}
                      {m.status}
                    </span>
                    <span style={{ color: 'var(--orange)', fontSize: 13, fontWeight: 600 }}>View →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
