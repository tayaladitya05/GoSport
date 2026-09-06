import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function StatBox({ val, label, highlight }) {
  return (
    <div className="stat-box">
      <div className="val" style={highlight ? { color: 'var(--orange)' } : {}}>{val}</div>
      <div className="lbl">{label}</div>
    </div>
  );
}

export default function MyStats() {
  const { user } = useAuth();
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the logged-in player's profile and their stats
    api.get('/players/me')
      .then(async (res) => {
        const p = res.data;
        setPlayer(p);
        if (p && p._id) {
          try {
            const s = await api.get(`/players/${p._id}/stats`);
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

  const isCricket = player?.sportType === 'cricket' || (stats?.cricket?.matches > 0);
  const isFootball = player?.sportType === 'football' || (stats?.football?.matches > 0);

  const cricketMatches = stats?.cricketMatches || [];
  const footballMatches = stats?.footballMatches || [];

  return (
    <div className="container page-fade" style={{ paddingTop: 36, paddingBottom: 60 }}>
      {/* Player Header Banner */}
      <div className="card" style={{ marginBottom: 28, borderColor: 'var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className={`badge badge-${player?.sportType || 'cricket'}`}>
                {player?.sportType}
              </span>
              <span className="badge" style={{ background: 'var(--card2)', color: 'var(--text-muted)' }}>
                {player?.teamName || 'Unassigned'}
              </span>
              {player?.jerseyNumber != null && (
                <span className="badge" style={{ background: 'var(--card2)', color: 'var(--text)' }}>
                  #{player.jerseyNumber}
                </span>
              )}
            </div>
            <h2 className="section-title" style={{ marginBottom: 4 }}>
              {player?.user?.name || user?.name || 'Player'}
            </h2>
            <p className="section-sub" style={{ marginBottom: 0, textTransform: 'capitalize' }}>
              {player?.role || 'Athlete'} · Career Overview & Match Performances
            </p>
          </div>
          <Link to="/matches" className="btn btn-secondary btn-sm">
            View All Matches →
          </Link>
        </div>
      </div>

      {!stats ? (
        <div className="empty">
          <h3>No stats available</h3>
          <p>Your stats will appear once matches and player contributions are recorded.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Cricket Career Stats */}
          {isCricket && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 22 }}>🏏</span>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontFamily: 'var(--font-head)' }}>
                  Cricket Career Statistics
                </h3>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: 12,
                marginBottom: 24,
              }}>
                <StatBox val={stats.cricket?.matches ?? 0} label="Matches" />
                <StatBox val={stats.cricket?.runs ?? 0} label="Total Runs" highlight />
                <StatBox val={stats.cricket?.ballsFaced ?? 0} label="Balls Faced" />
                <StatBox val={stats.cricket?.fours ?? 0} label="Fours (4s)" />
                <StatBox val={stats.cricket?.sixes ?? 0} label="Sixes (6s)" />
                <StatBox val={stats.cricket?.strikeRate ?? '0.0'} label="Strike Rate" />
                <StatBox val={stats.cricket?.wickets ?? 0} label="Wickets" highlight />
                <StatBox val={stats.cricket?.overs ?? 0} label="Overs" />
              </div>

              {/* Cricket Match-by-Match Performances */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                    Match-by-Match Performance History
                  </h4>
                </div>
                {cricketMatches.length === 0 ? (
                  <div className="empty" style={{ padding: 32 }}>
                    <p style={{ color: 'var(--text-muted)' }}>No match performances recorded yet.</p>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Match</th>
                          <th>Date</th>
                          <th>Teams</th>
                          <th style={{ textAlign: 'center' }}>Runs (Balls)</th>
                          <th style={{ textAlign: 'center' }}>4s / 6s</th>
                          <th style={{ textAlign: 'center' }}>SR</th>
                          <th style={{ textAlign: 'center' }}>Wkts</th>
                          <th style={{ textAlign: 'center' }}>Overs</th>
                          <th style={{ textAlign: 'center' }}>Dismissal</th>
                          <th style={{ textAlign: 'right' }}>Scorecard</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cricketMatches.map((m) => (
                          <tr key={m.statId}>
                            <td style={{ fontWeight: 600 }}>{m.matchName}</td>
                            <td style={{ color: 'var(--text-dim)', fontSize: 13 }}>
                              {m.matchDate ? new Date(m.matchDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </td>
                            <td>{m.teams?.join(' vs ') || '—'}</td>
                            <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--orange)' }}>
                              {m.runs} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>({m.ballsFaced})</span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {m.fours} / {m.sixes}
                            </td>
                            <td style={{ textAlign: 'center' }}>{m.strikeRate}</td>
                            <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--orange)' }}>
                              {m.wickets}
                            </td>
                            <td style={{ textAlign: 'center' }}>{m.overs}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: m.isOut ? '#ef4444' : '#22c55e',
                              }}>
                                {m.isOut ? 'Out' : 'Not Out'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <Link
                                to={`/matches/${m.matchId}`}
                                style={{ color: 'var(--orange)', fontSize: 13, fontWeight: 600 }}
                              >
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

          {/* Football Career Stats */}
          {isFootball && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 22 }}>⚽</span>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontFamily: 'var(--font-head)' }}>
                  Football Career Statistics
                </h3>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: 12,
                marginBottom: 24,
              }}>
                <StatBox val={stats.football?.matches ?? 0} label="Matches" />
                <StatBox val={stats.football?.goals ?? 0} label="Goals" highlight />
                <StatBox val={stats.football?.assists ?? 0} label="Assists" highlight />
                <StatBox val={stats.football?.yellowCards ?? 0} label="Yellow Cards" />
                <StatBox val={stats.football?.redCards ?? 0} label="Red Cards" />
                <StatBox val={stats.football?.minutesPlayed ?? 0} label="Minutes Played" />
              </div>

              {/* Football Match-by-Match Performances */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                    Match-by-Match Performance History
                  </h4>
                </div>
                {footballMatches.length === 0 ? (
                  <div className="empty" style={{ padding: 32 }}>
                    <p style={{ color: 'var(--text-muted)' }}>No match performances recorded yet.</p>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Match</th>
                          <th>Date</th>
                          <th>Teams</th>
                          <th style={{ textAlign: 'center' }}>Goals</th>
                          <th style={{ textAlign: 'center' }}>Assists</th>
                          <th style={{ textAlign: 'center' }}>Yellow Cards</th>
                          <th style={{ textAlign: 'center' }}>Red Cards</th>
                          <th style={{ textAlign: 'center' }}>Minutes</th>
                          <th style={{ textAlign: 'right' }}>Scorecard</th>
                        </tr>
                      </thead>
                      <tbody>
                        {footballMatches.map((m) => (
                          <tr key={m.statId}>
                            <td style={{ fontWeight: 600 }}>{m.matchName}</td>
                            <td style={{ color: 'var(--text-dim)', fontSize: 13 }}>
                              {m.matchDate ? new Date(m.matchDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </td>
                            <td>{m.teams?.join(' vs ') || '—'}</td>
                            <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--orange)' }}>
                              {m.goals}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 600 }}>{m.assists}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ color: m.yellowCards > 0 ? '#eab308' : 'inherit', fontWeight: 600 }}>
                                {m.yellowCards}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ color: m.redCards > 0 ? '#ef4444' : 'inherit', fontWeight: 600 }}>
                                {m.redCards}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>{m.minutesPlayed}</td>
                            <td style={{ textAlign: 'right' }}>
                              <Link
                                to={`/matches/${m.matchId}`}
                                style={{ color: 'var(--orange)', fontSize: 13, fontWeight: 600 }}
                              >
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
        </div>
      )}
    </div>
  );
}
