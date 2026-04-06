import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CRICKET_ROLES  = ['batsman', 'bowler', 'all-rounder', 'wicket-keeper'];
const FOOTBALL_ROLES = ['striker', 'midfielder', 'defender', 'goalkeeper'];

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm] = useState({
    name:'', email:'', password:'', role:'player',
    sportType:'cricket', teamName:'', playerRole:'', jerseyNumber:'',
  });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const roleOptions = form.sportType === 'cricket' ? CRICKET_ROLES : FOOTBALL_ROLES;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const payload = { name:form.name, email:form.email, password:form.password, role:form.role };
      if (form.role === 'player') {
        payload.sportType    = form.sportType;
        payload.teamName     = form.teamName;
        payload.playerRole   = form.playerRole;
        payload.jerseyNumber = form.jerseyNumber ? Number(form.jerseyNumber) : undefined;
      }
      await register(payload);
      setSuccess(`✓ ${form.name} registered as ${form.role} successfully!`);
      setForm({ name:'', email:'', password:'', role:'player', sportType:'cricket', teamName:'', playerRole:'', jerseyNumber:'' });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', position:'relative', overflow:'hidden' }}>

      <style>{`
        @keyframes drift1  { 0%,100%{ transform:translate(0,0); } 50%{ transform:translate(30px,-20px); } }
        @keyframes drift2  { 0%,100%{ transform:translate(0,0); } 50%{ transform:translate(-20px,30px); } }
        @keyframes gridFade{ 0%,100%{ opacity:0.03; } 50%{ opacity:0.06; } }
        @keyframes shimmer { 0%{ background-position:-200% center; } 100%{ background-position:200% center; } }
        @keyframes successPop { 0%{ transform:scale(0.92); opacity:0; } 100%{ transform:scale(1); opacity:1; } }
        .reg-input {
          width:100%; padding:11px 14px 11px 42px;
          background:var(--card2); border:1.5px solid var(--border);
          border-radius:10px; color:var(--text);
          font-family:var(--font-body); font-size:14px;
          transition:border-color 0.2s, box-shadow 0.2s, background 0.2s; outline:none;
        }
        .reg-input::placeholder { color:var(--text-dim); }
        .reg-input:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-glow); background:var(--card); }
        .reg-select {
          width:100%; padding:11px 14px;
          background:var(--card2); border:1.5px solid var(--border);
          border-radius:10px; color:var(--text);
          font-family:var(--font-body); font-size:14px;
          transition:border-color 0.2s, box-shadow 0.2s; outline:none; cursor:pointer;
        }
        .reg-select:focus { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-glow); }
        .reg-select option { background:var(--card2); color:var(--text); }
        .reg-submit {
          flex:1; padding:13px; border:none; border-radius:10px;
          background:linear-gradient(135deg, var(--accent), var(--accent2));
          color:#fff; font-family:var(--font-body); font-size:14px; font-weight:700;
          cursor:pointer; letter-spacing:0.03em;
          transition:opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow:0 4px 20px var(--accent-glow); position:relative; overflow:hidden;
        }
        .reg-submit::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent); background-size:200% 100%; animation:shimmer 2.4s linear infinite; }
        .reg-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 28px var(--accent-glow); }
        .reg-submit:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
        .role-btn {
          flex:1; padding:13px 0; border:1.5px solid var(--border); border-radius:10px;
          background:var(--card2); cursor:pointer;
          font-family:var(--font-body); font-weight:700; font-size:13px;
          transition:all 0.2s; display:flex; flex-direction:column; align-items:center; gap:4px;
        }
        .role-btn.active { background:var(--accent-glow); border-color:var(--accent); color:var(--accent); }
        .role-btn:not(.active) { color:var(--text-muted); }
        .role-btn:not(.active):hover { border-color:var(--border2); background:var(--card); }
        .sport-btn {
          flex:1; padding:10px; border-radius:8px; border:1.5px solid var(--border);
          background:var(--card2); cursor:pointer; font-family:var(--font-body); font-weight:600; font-size:13px;
          transition:all 0.18s; color:var(--text-muted);
        }
        .sport-btn.active { background:var(--accent-glow); border-color:var(--accent); color:var(--accent); }
        .player-section { animation:successPop 0.25s ease both; }
      `}</style>

      {/* Background decorations */}
      <div style={{ position:'fixed', top:-140, left:-140, width:480, height:480, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,106,247,0.13) 0%, transparent 65%)', animation:'drift1 10s ease-in-out infinite', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:-120, right:-120, width:420, height:420, borderRadius:'50%', background:'radial-gradient(circle, rgba(224,95,255,0.09) 0%, transparent 65%)', animation:'drift2 12s ease-in-out infinite', pointerEvents:'none' }} />
      <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(var(--border) 1px, transparent 1px),linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize:'48px 48px', animation:'gridFade 6s ease-in-out infinite', pointerEvents:'none' }} />

      <div className="container page-fade" style={{ paddingTop:40, paddingBottom:60, position:'relative', zIndex:1 }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:32 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg, var(--accent), var(--accent2))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>👤</div>
              <h2 style={{ fontFamily:'var(--font-head)', fontSize:'2rem', letterSpacing:'-0.01em' }}>Register User</h2>
            </div>
            <p style={{ color:'var(--text-muted)', fontSize:14 }}>Create a new player or admin account</p>
          </div>
          <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:20, background:'var(--accent-glow)', border:'1px solid var(--accent)', fontSize:11, color:'var(--accent)', fontWeight:700, letterSpacing:'0.07em' }}>
            🔐 ADMIN ONLY
          </span>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,340px)', gap:24, alignItems:'start' }}>

          {/* ── Main form card ── */}
          <div style={{ background:'var(--card)', border:'1px solid var(--border2)', borderRadius:16, padding:28, boxShadow:'0 16px 48px rgba(0,0,0,0.2)' }}>
            <div style={{ height:3, borderRadius:'2px 2px 0 0', background:'linear-gradient(90deg, var(--accent), var(--accent2))', margin:'-28px -28px 28px' }} />

            <form onSubmit={handleSubmit}>
              {/* Basic fields */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                <div>
                  <label className="label" style={{ marginBottom:6 }}>Full Name</label>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:13, opacity:0.5, pointerEvents:'none' }}>👤</span>
                    <input className="reg-input" placeholder="User's full name" value={form.name} onChange={e => set('name', e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="label" style={{ marginBottom:6 }}>Email</label>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:13, opacity:0.5, pointerEvents:'none' }}>✉️</span>
                    <input className="reg-input" type="email" placeholder="user@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom:20 }}>
                <label className="label" style={{ marginBottom:6 }}>Password</label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:13, opacity:0.5, pointerEvents:'none' }}>🔒</span>
                  <input className="reg-input" type="password" placeholder="Set a secure password" value={form.password} onChange={e => set('password', e.target.value)} required />
                </div>
              </div>

              {/* Role selector */}
              <div style={{ marginBottom:24 }}>
                <label className="label" style={{ marginBottom:8 }}>Role</label>
                <div style={{ display:'flex', gap:10 }}>
                  {[
                    { r:'player', icon:'🏏', desc:'Athlete'   },
                    { r:'admin',  icon:'⚙️', desc:'Manager'   },
                  ].map(({ r, icon, desc }) => (
                    <button key={r} type="button"
                      className={`role-btn ${form.role === r ? 'active' : ''}`}
                      onClick={() => set('role', r)}
                    >
                      <span style={{ fontSize:20 }}>{icon}</span>
                      <span style={{ fontSize:13, textTransform:'capitalize' }}>{r}</span>
                      <span style={{ fontSize:10, opacity:0.7 }}>{desc}</span>
                    </button>
                  ))}
                </div>
                <p style={{ color:'var(--text-dim)', fontSize:11, marginTop:8 }}>
                  Spectators self-register via the login page.
                </p>
              </div>

              {/* Player profile section */}
              {form.role === 'player' && (
                <div className="player-section" style={{ borderTop:'1px solid var(--border)', paddingTop:20, marginBottom:20 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                    <div style={{ width:28, height:28, borderRadius:7, background:'var(--accent-glow)', border:'1px solid var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>🏅</div>
                    <p style={{ color:'var(--accent)', fontWeight:700, fontSize:12, textTransform:'uppercase', letterSpacing:'0.1em' }}>Player Profile</p>
                  </div>

                  {/* Sport toggle */}
                  <div style={{ marginBottom:14 }}>
                    <label className="label" style={{ marginBottom:6 }}>Sport</label>
                    <div style={{ display:'flex', gap:8 }}>
                      {[{ v:'cricket', icon:'🏏' }, { v:'football', icon:'⚽' }].map(({ v, icon }) => (
                        <button key={v} type="button"
                          className={`sport-btn ${form.sportType === v ? 'active' : ''}`}
                          onClick={() => { set('sportType', v); set('playerRole', ''); }}
                        >
                          {icon} {v.charAt(0).toUpperCase()+v.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:0 }}>
                    <div>
                      <label className="label" style={{ marginBottom:6 }}>Team Name</label>
                      <input className="reg-input" style={{ paddingLeft:14 }} placeholder="Team Alpha" value={form.teamName} onChange={e => set('teamName', e.target.value)} required />
                    </div>
                    <div>
                      <label className="label" style={{ marginBottom:6 }}>Jersey No.</label>
                      <input className="reg-input" style={{ paddingLeft:14 }} placeholder="10" type="number" value={form.jerseyNumber} onChange={e => set('jerseyNumber', e.target.value)} />
                    </div>
                    <div style={{ gridColumn:'1/-1' }}>
                      <label className="label" style={{ marginBottom:6 }}>Player Role</label>
                      <select className="reg-select" value={form.playerRole} onChange={e => set('playerRole', e.target.value)} required>
                        <option value="">Select position</option>
                        {roleOptions.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {error   && (
                <div style={{ background:'rgba(224,85,85,0.1)', border:'1px solid var(--error)', borderRadius:8, padding:'10px 14px', marginBottom:14, color:'var(--error)', fontSize:13 }}>⚠️ {error}</div>
              )}
              {success && (
                <div style={{ background:'rgba(76,218,127,0.1)', border:'1px solid #4cda7f', borderRadius:8, padding:'10px 14px', marginBottom:14, color:'#4cda7f', fontSize:13, animation:'successPop 0.3s ease' }}>✓ {success}</div>
              )}

              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button type="submit" className="reg-submit" disabled={loading}>
                  {loading ? '✦ Registering...' : '→ Register User'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')} style={{ padding:'13px 20px', borderRadius:10, flexShrink:0 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* ── Side info card ── */}
          <div style={{ position:'sticky', top:80 }}>
            <div style={{ background:'var(--card)', border:'1px solid var(--border2)', borderRadius:16, padding:22, boxShadow:'0 16px 48px rgba(0,0,0,0.2)', marginBottom:14 }}>
              <div style={{ height:3, borderRadius:'2px 2px 0 0', background:'linear-gradient(90deg, var(--accent2), var(--accent))', margin:'-22px -22px 18px' }} />
              <p style={{ fontWeight:700, fontSize:13, marginBottom:14 }}>Registration Guide</p>
              {[
                { icon:'🏏', title:'Player',    desc:'Creates a user account + player profile with sport, team & jersey details. They can view matches and their own stats.'    },
                { icon:'⚙️', title:'Admin',     desc:'Full access — create matches, register players, record stats, and use AI squad suggestions.' },
                { icon:'👁️', title:'Spectator', desc:'Can self-register on the login page. View-only access to live scores and player stats.' },
              ].map((r,i) => (
                <div key={i} style={{ display:'flex', gap:10, marginBottom:14, alignItems:'flex-start' }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'var(--card2)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>{r.icon}</div>
                  <div>
                    <p style={{ fontWeight:700, fontSize:12, marginBottom:2 }}>{r.title}</p>
                    <p style={{ color:'var(--text-muted)', fontSize:11, lineHeight:1.5 }}>{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background:'var(--accent-glow)', border:'1px solid var(--accent)', borderRadius:12, padding:16 }}>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>💡 Tip</p>
              <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>After registering a player, share their email & password with them. They can log in and update their availability for matches.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
