import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import io from 'socket.io-client';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function MatchDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [match, setMatch] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [players, setPlayers] = useState([]);
  const [teamScores, setTeamScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiSquad, setAiSquad] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [tab, setTab] = useState('overview');
  
  const [selectedPlayerForStats, setSelectedPlayerForStats] = useState("");
  const [statsLoading, setStatsLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [matchRes, playersRes] = await Promise.all([
        api.get(`/matches`),
        token ? api.get(`/matches/${id}/players`) : Promise.resolve({ data: [] }),
      ]);
      const m = matchRes.data.find(x => x._id === id);
      setMatch(m);
      setPlayers(playersRes.data);
      if (token) {
        try {
          const sc = await api.get(`/matches/${id}/scorecard`);
          setScorecard(sc.data);
          setTeamScores(sc.data.teamScores || []);
        } catch {}
      }
    } catch {}
    setLoading(false);
  }, [id, token]);

  useEffect(() => { loadData(); }, [loadData]);

  // Socket.io for live score updates
  useEffect(() => {
    if (!match || match.status !== 'live') return;
    const socket = io(API_BASE);
    socket.on('scoreUpdate', (data) => {
      if (data.matchId === id) {
        setTeamScores(data.teamScores);
      }
    });
    return () => socket.disconnect();
  }, [match, id]);

  const getAiSquad = async () => {
    if (!match) return;
    setAiLoading(true);
    try {
      const res = await api.post(`/matches/${id}/ai-squad/${match.sportType}`);
      setAiSquad(res.data);
      setTab('ai-squad');
    } catch (e) {
      alert(e.response?.data?.message || 'AI squad failed');
    }
    setAiLoading(false);
  };

  const handleStatusChange = async (e) => {
    try {
      const newStatus = e.target.value;
      await api.put(`/matches/${match._id}/status`, { status: newStatus });
      setMatch({ ...match, status: newStatus });
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const markAvailability = async (availability) => {
    try {
      await api.post(`/matches/${match._id}/availability`, { availability });
      alert("Availability saved!");
      loadData();
    } catch (error) {
      alert("Error marking availability");
    }
  };

  const assignPlayer = async (matchPlayerId, teamName) => {
    try {
      await api.put(`/matches/matchplayer/${matchPlayerId}`, { teamName, isStarting: true });
      loadData();
    } catch (error) {
      alert("Error assigning player");
    }
  };

  const handleUpdateScore = async (runs) => {
    if (!selectedPlayerForStats) return alert("Select a player first");
    const p = players.find(x => x.player._id === selectedPlayerForStats);
    setStatsLoading(true);
    try {
       if (match.sportType === 'cricket') {
          await api.put(`/stats/cricket/update`, {
            matchId: match._id,
            playerId: selectedPlayerForStats,
            teamName: p.teamName,
            runs: runs
          });
       } else {
          await api.put(`/stats/football/update`, {
            matchId: match._id,
            playerId: selectedPlayerForStats,
            teamName: p.teamName
          });
       }
       loadData();
    } catch(e) {
       alert("Failed to update score");
    }
    setStatsLoading(false);
  };

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (!match) return <div className="container" style={{ paddingTop: 60 }}><p style={{ color: 'var(--text-muted)' }}>Match not found.</p></div>;

  const tabs = ['overview', 'players', ...(scorecard ? ['scorecard'] : []), ...(user?.role === 'admin' ? ['ai-squad'] : [])];

  return (
    <div className="container page-fade" style={{ paddingTop: 36, paddingBottom: 60 }}>
      {/* Back */}
      <Link to="/matches" style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
        ← Back to Matches
      </Link>

      {/* Match header */}
      <div className="card" style={{ marginBottom: 20, borderColor: match.status === 'live' ? 'var(--orange)' : 'var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              {user?.role === 'admin' ? (
                <select 
                   value={match.status} 
                   onChange={handleStatusChange} 
                   className={`badge badge-${match.status}`}
                   style={{ background: 'transparent', cursor: 'pointer', outline: 'none' }}
                >
                   <option value="upcoming" style={{ color: 'black' }}>Upcoming</option>
                   <option value="live" style={{ color: 'black' }}>Live</option>
                   <option value="completed" style={{ color: 'black' }}>Completed</option>
                </select>
              ) : (
                <span className={`badge badge-${match.status}`}>
                  {match.status === 'live' && <span className="pulse" style={{ marginRight: 4 }} />}
                  {match.status}
                </span>
              )}
              <span className={`badge badge-${match.sportType}`}>{match.sportType}</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', letterSpacing: '0.04em', marginBottom: 6 }}>{match.matchName}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>📍 {match.venue} · 📅 {new Date(match.matchDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          {user?.role === 'admin' && (
            <button className="btn btn-outline btn-sm" onClick={getAiSquad} disabled={aiLoading}>
              {aiLoading ? 'Loading...' : '🤖 AI Squad'}
            </button>
          )}
        </div>

        {/* Teams vs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
          {match.teams?.map((team, i) => {
            const ts = teamScores.find(s => s.teamName === team);
            return (
              <React.Fragment key={team}>
                {i > 0 && <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-head)', fontSize: '1.4rem' }}>VS</span>}
                <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 20px', minWidth: 120 }}>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{team}</p>
                  {ts && match.sportType === 'cricket' && (
                    <p style={{ color: 'var(--orange)', fontFamily: 'var(--font-head)', fontSize: '1.3rem', marginTop: 4 }}>
                      {ts.runs}/{ts.wickets} <span style={{ fontSize: '0.9rem' }}>({ts.overs} ov)</span>
                    </p>
                  )}
                  {ts && match.sportType === 'football' && (
                    <p style={{ color: 'var(--orange)', fontFamily: 'var(--font-head)', fontSize: '1.5rem', marginTop: 4 }}>{ts.goals}</p>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {user?.role === 'player' && match.status === 'upcoming' && (
         <div className="card" style={{ marginBottom: 20, borderColor: 'var(--border)' }}>
            <h3 style={{ marginBottom: 8, fontSize: '1.1rem' }}>Your Availability</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 13 }}>Mark your availability for this upcoming match to be assigned by the admin.</p>
            <div style={{ display: 'flex', gap: 10 }}>
               <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--success)', color: 'var(--success)' }} onClick={() => markAvailability('available')}>👍 Available</button>
               <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--orange)', color: 'var(--orange)' }} onClick={() => markAvailability('not_available')}>⛔ Not Available</button>
            </div>
         </div>
      )}

      {user?.role === 'admin' && match.status === 'live' && (
         <div className="card" style={{ marginBottom: 20, borderColor: 'var(--orange)', background: 'var(--card)' }}>
            <h3 style={{ marginBottom: 8, fontSize: '1.1rem', color: 'var(--orange)' }}>Quick Stats Update</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 12, fontSize: 13 }}>Select a player and update their live scores.</p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
               <select className="input" value={selectedPlayerForStats} onChange={(e) => setSelectedPlayerForStats(e.target.value)} style={{ padding: '8.5px 12px', minWidth: 200, fontSize: 14 }}>
                  <option value="">-- Select Player --</option>
                  {players.filter(p => p.teamName !== 'Unassigned').map(p => (
                     <option key={p.player._id} value={p.player._id}>{p.player.user?.name || "Unknown"} ({p.teamName})</option>
                  ))}
               </select>
               
               {match.sportType === 'cricket' ? (
                  <>
                     <button className="btn btn-primary" disabled={statsLoading} onClick={() => handleUpdateScore(1)}>+1 Run</button>
                     <button className="btn btn-primary" disabled={statsLoading} onClick={() => handleUpdateScore(4)}>+4</button>
                     <button className="btn btn-primary" disabled={statsLoading} onClick={() => handleUpdateScore(6)}>+6</button>
                  </>
               ) : (
                  <button className="btn btn-primary" disabled={statsLoading} onClick={() => handleUpdateScore()}>⚽ Goal</button>
               )}
            </div>
         </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 18px', border: 'none', borderBottom: `2px solid ${tab === t ? 'var(--orange)' : 'transparent'}`,
            background: 'transparent', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, textTransform: 'capitalize',
            color: tab === t ? 'var(--orange)' : 'var(--text-muted)', transition: 'color 0.15s',
          }}>{t.replace('-', ' ')}</button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <div className="grid-2">
          <div className="card card-sm">
            <p className="label">Sport</p>
            <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>{match.sportType}</p>
          </div>
          <div className="card card-sm">
            <p className="label">Status</p>
            <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>{match.status}</p>
          </div>
          <div className="card card-sm">
            <p className="label">Venue</p>
            <p style={{ fontWeight: 600 }}>{match.venue}</p>
          </div>
          <div className="card card-sm">
            <p className="label">Date</p>
            <p style={{ fontWeight: 600 }}>{new Date(match.matchDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      )}

      {/* Tab: Players */}
      {tab === 'players' && (
        players.length === 0 ? (
          <div className="empty"><h3>No players added</h3><p>Admin can add players, or players can mark availability to join the pool.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Team</th>
                  <th>Role</th>
                  <th>Sport</th>
                  <th>Availability</th>
                  {user?.role === 'admin' && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {players.map(mp => (
                  <tr key={mp._id}>
                    <td style={{ fontWeight: 600 }}>{mp.player?.user?.name || '—'}</td>
                    <td>{mp.teamName}</td>
                    <td style={{ textTransform: 'capitalize' }}>{mp.player?.role || '—'}</td>
                    <td><span className={`badge badge-${mp.player?.sportType}`}>{mp.player?.sportType}</span></td>
                    <td>
                      <span style={{ color: mp.availability === 'available' ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600, textTransform: 'capitalize', fontSize: 13 }}>
                        {mp.availability || 'pending'}
                      </span>
                    </td>
                    {user?.role === 'admin' && (
                      <td>
                        {mp.teamName === 'Unassigned' && mp.availability === 'available' ? (
                           <div style={{ display: 'flex', gap: 6 }}>
                             {match.teams.map((t) => (
                               <button key={t} className="btn btn-sm btn-outline" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => assignPlayer(mp._id, t)}>{t}</button>
                             ))}
                           </div>
                        ) : (
                           <span style={{color:'var(--text-muted)', fontSize: 12}}>—</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Tab: Scorecard */}
      {tab === 'scorecard' && scorecard && (
        <div>
          {match.sportType === 'cricket' ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Team</th>
                    <th>Runs</th>
                    <th>Balls</th>
                    <th>4s</th>
                    <th>6s</th>
                    <th>SR</th>
                    <th>Wkts</th>
                    <th>Overs</th>
                  </tr>
                </thead>
                <tbody>
                  {scorecard.playerScorecards?.map((p, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{p.playerName}</td>
                      <td>{p.teamName}</td>
                      <td style={{ color: 'var(--orange)', fontWeight: 700 }}>{p.batting.runs}</td>
                      <td>{p.batting.balls}</td>
                      <td>{p.batting.fours}</td>
                      <td>{p.batting.sixes}</td>
                      <td>{p.batting.strikeRate}</td>
                      <td>{p.bowling.wickets}</td>
                      <td>{p.bowling.overs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Team</th>
                    <th>Goals</th>
                    <th>Assists</th>
                    <th>Yellow</th>
                    <th>Red</th>
                    <th>Minutes</th>
                  </tr>
                </thead>
                <tbody>
                  {scorecard.playerScorecards?.map((p, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{p.playerName}</td>
                      <td>{p.teamName}</td>
                      <td style={{ color: 'var(--orange)', fontWeight: 700 }}>{p.goals}</td>
                      <td>{p.assists}</td>
                      <td>{p.yellowCards}</td>
                      <td>{p.redCards}</td>
                      <td>{p.minutesPlayed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: AI Squad */}
      {tab === 'ai-squad' && (
        <div>
          {!aiSquad ? (
            <div className="empty">
              <h3>AI Squad</h3>
              <p style={{ marginBottom: 16 }}>Get AI-powered squad suggestions based on player career stats</p>
              <button className="btn btn-primary" onClick={getAiSquad} disabled={aiLoading}>{aiLoading ? 'Analyzing...' : '🤖 Generate Squad'}</button>
            </div>
          ) : (
            <div>
              <div style={{ background: 'var(--orange-glow)', border: '1px solid var(--orange)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: 'var(--orange)' }}>
                🤖 {aiSquad.message}
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Player</th>
                      <th>Team</th>
                      <th>Role</th>
                      <th>Score</th>
                      <th>Matches</th>
                      <th>Reasoning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiSquad.squad?.map((p, i) => (
                      <tr key={p.playerId}>
                        <td style={{ color: 'var(--orange)', fontWeight: 700 }}>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{p.playerName}</td>
                        <td>{p.teamName}</td>
                        <td style={{ textTransform: 'capitalize' }}>{p.role}</td>
                        <td style={{ color: 'var(--orange)', fontWeight: 700 }}>{p.score}</td>
                        <td>{p.careerMatches}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12, maxWidth: 200 }}>{p.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
