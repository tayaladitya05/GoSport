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
  const [playerProfile, setPlayerProfile] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const promises = [
      api.get('/matches').then(r => setMatches(r.data)).catch(() => {}),
    ];

    if (user?.role === 'player') {
      promises.push(
        api.get('/players/me')
          .then(async (res) => {
            const p = res.data;
            setPlayerProfile(p);
            if (p && p._id) {
              const sRes = await api.get(`/players/${p._id}/stats`);
              setPlayerStats(sRes.data);
            }
          })
          .catch(() => {})
      );
    }

    Promise.all(promises).finally(() => setLoading(false));
  }, [user]);

  const live      = matches.filter(m => m.status === 'live');
  const upcoming  = matches.filter(m => m.status === 'upcoming');
  const completed = matches.filter(m => m.status === 'completed');
  const recent    = matches.slice(0, 5);

  const isPlayer = user?.role === 'player';
  const isCricket = playerProfile?.sportType === 'cricket' || (playerStats?.cricket?.matches > 0);

  const myCricketMatches = playerStats?.cricketMatches || [];
  const myFootballMatches = playerStats?.footballMatches || [];
  const recentMyMatches = isCricket ? myCricketMatches.slice(0, 4) : myFootballMatches.slice(0, 4);

  return (
    <div className="container page-fade" style={{ paddingTop: 36, paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
          Welcome back
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: 6 }}>
              {playerProfile?.user?.name || user?.name || 'Dashboard'}
            </h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-block',
                background: 'var(--accent-glow)', color: 'var(--accent)',
                border: '1px solid var(--accent)', borderRadius: 20,
                padding: '3px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>{user?.role}</span>
              {playerProfile && (
                <>
                  <span className={`badge badge-${playerProfile.sportType}`}>
                    {playerProfile.sportType}
                  </span>
                  <span className="badge" style={{ background: 'var(--card2)', color: 'var(--text-muted)' }}>
                    {playerProfile.teamName}
                  </span>
                  {playerProfile.jerseyNumber != null && (
                    <span className="badge" style={{ background: 'var(--card2)', color: 'var(--text)' }}>
                      #{playerProfile.jerseyNumber}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          {isPlayer && (
            <Link to="/my-stats" className="btn btn-primary btn-sm">
              Full Stats & Performances →
            </Link>
          )}
        </div>
      </div>

      {loading ? <div className="spinner" /> : (
        <>
          {/* Player Personal Performance Section (Visible on login) */}
          {isPlayer && playerStats && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{isCricket ? '🏏' : '⚽'}</span>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-head)' }}>
                    My Career Stats
                  </h3>
                </div>
                <Link to="/my-stats" style={{ color: 'var(--orange)', fontSize: 13, fontWeight: 600 }}>
                  Detailed Breakdown →
                </Link>
              </div>

              {/* Career Stats Grid */}
              {isCricket ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: 12,
                  marginBottom: 20,
                }}>
                  <StatCard val={playerStats.cricket?.matches ?? 0} label="Matches" />
                  <StatCard val={playerStats.cricket?.runs ?? 0} label="Total Runs" color="var(--orange)" />
                  <StatCard val={playerStats.cricket?.fours ?? 0} label="4s" />
                  <StatCard val={playerStats.cricket?.sixes ?? 0} label="6s" />
                  <StatCard val={playerStats.cricket?.strikeRate ?? '0.0'} label="Strike Rate" />
                  <StatCard val={playerStats.cricket?.wickets ?? 0} label="Wickets" color="var(--orange)" />
                  <StatCard val={playerStats.cricket?.overs ?? 0} label="Overs" />
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: 12,
                  marginBottom: 20,
                }}>
                  <StatCard val={playerStats.football?.matches ?? 0} label="Matches" />
                  <StatCard val={playerStats.football?.goals ?? 0} label="Goals" color="var(--orange)" />
                  <StatCard val={playerStats.football?.assists ?? 0} label="Assists" color="var(--orange)" />
                  <StatCard val={playerStats.football?.yellowCards ?? 0} label="Yellow Cards" />
                  <StatCard val={playerStats.football?.redCards ?? 0} label="Red Cards" />
                  <StatCard val={playerStats.football?.minutesPlayed ?? 0} label="Minutes" />
                </div>
              )}

              {/* My Match Performance History */}
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 28 }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>My Match Performances</p>
                  <Link to="/my-stats" style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 600 }}>
                    View all ({recentMyMatches.length}) →
                  </Link>
                </div>

                {recentMyMatches.length === 0 ? (
                  <div className="empty" style={{ padding: 24 }}>
                    <p style={{ color: 'var(--text-muted)' }}>No matches recorded yet. Match contributions will appear here once played.</p>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Match</th>
                          <th>Date</th>
                          {isCricket ? (
                            <>
                              <th style={{ textAlign: 'center' }}>Runs (Balls)</th>
                              <th style={{ textAlign: 'center' }}>4s / 6s</th>
                              <th style={{ textAlign: 'center' }}>SR</th>
                              <th style={{ textAlign: 'center' }}>Wkts</th>
                              <th style={{ textAlign: 'center' }}>Status</th>
                            </>
                          ) : (
                            <>
                              <th style={{ textAlign: 'center' }}>Goals</th>
                              <th style={{ textAlign: 'center' }}>Assists</th>
                              <th style={{ textAlign: 'center' }}>Cards (Y/R)</th>
                              <th style={{ textAlign: 'center' }}>Minutes</th>
                            </>
                          )}
                          <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentMyMatches.map((m) => (
                          <tr key={m.statId}>
                            <td style={{ fontWeight: 600 }}>{m.matchName}</td>
                            <td style={{ color: 'var(--text-dim)', fontSize: 13 }}>
                              {m.matchDate ? new Date(m.matchDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                            </td>
                            {isCricket ? (
                              <>
                                <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--orange)' }}>
                                  {m.runs} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>({m.ballsFaced})</span>
                                </td>
                                <td style={{ textAlign: 'center' }}>{m.fours} / {m.sixes}</td>
                                <td style={{ textAlign: 'center' }}>{m.strikeRate}</td>
                                <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--orange)' }}>{m.wickets}</td>
                                <td style={{ textAlign: 'center' }}>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: m.isOut ? '#ef4444' : '#22c55e' }}>
                                    {m.isOut ? 'Out' : 'Not Out'}
                                  </span>
                                </td>
                              </>
                            ) : (
                              <>
                                <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--orange)' }}>{m.goals}</td>
                                <td style={{ textAlign: 'center', fontWeight: 600 }}>{m.assists}</td>
                                <td style={{ textAlign: 'center' }}>{m.yellowCards} / {m.redCards}</td>
                                <td style={{ textAlign: 'center' }}>{m.minutesPlayed}</td>
                              </>
                            )}
                            <td style={{ textAlign: 'right' }}>
                              <Link to={`/matches/${m.matchId}`} style={{ color: 'var(--orange)', fontSize: 13, fontWeight: 600 }}>
                                View →
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tournament Overview Stats */}
          <div style={{ marginBottom: 14 }}>
            <p className="label">Tournament Matches Overview</p>
          </div>
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
                <Link to="/matches"  className="btn btn-primary">View All Matches</Link>
                <Link to="/my-stats" className="btn btn-secondary">Full Career Stats</Link>
                <Link to="/players"  className="btn btn-secondary">Browse All Players</Link>
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
              <p style={{ fontWeight: 700, fontSize: 15 }}>Recent Tournament Matches</p>
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
                          {m.teams?.join(' vs ')} · {new Date(m.matchDate).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true })}
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
