import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login }  = useAuth();
  const location   = useLocation();
  const registered = location.state?.registered;
  const navigate   = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)', overflow: 'hidden', position: 'relative' }}>

      {/* ── Animated background layer ── */}
      <style>{`
        @keyframes drift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-30px) scale(1.08); } }
        @keyframes drift2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-30px,40px) scale(1.05); } }
        @keyframes drift3 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,20px); } }
        @keyframes gridFade { 0%,100% { opacity:0.03; } 50% { opacity:0.07; } }
        @keyframes floatIcon { 0%,100% { transform: translateY(0px) rotate(0deg); opacity:0.07; } 50% { transform: translateY(-18px) rotate(8deg); opacity:0.13; } }
        @keyframes floatIcon2 { 0%,100% { transform: translateY(0px) rotate(0deg); opacity:0.06; } 50% { transform: translateY(-22px) rotate(-6deg); opacity:0.11; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes pulseRing { 0%,100%{ transform:scale(1); opacity:0.5; } 50%{ transform:scale(1.04); opacity:1; } }
        .auth-input-fancy {
          width:100%; padding:13px 16px 13px 44px;
          background: var(--card2); border: 1.5px solid var(--border);
          border-radius:10px; color:var(--text);
          font-family:var(--font-body); font-size:14px;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          outline:none;
        }
        .auth-input-fancy::placeholder { color:var(--text-dim); }
        .auth-input-fancy:focus {
          border-color:var(--accent);
          box-shadow: 0 0 0 3px var(--accent-glow);
          background: var(--card);
        }
        .input-wrap { position:relative; }
        .input-icon {
          position:absolute; left:14px; top:50%; transform:translateY(-50%);
          font-size:15px; pointer-events:none; opacity:0.5;
        }
        .signin-btn {
          width:100%; padding:14px; border:none; border-radius:10px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color:#fff; font-family:var(--font-body); font-size:15px; font-weight:700;
          cursor:pointer; letter-spacing:0.03em;
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 24px var(--accent-glow);
          position:relative; overflow:hidden;
        }
        .signin-btn::after {
          content:''; position:absolute; inset:0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          background-size:200% 100%;
          animation: shimmer 2.4s linear infinite;
        }
        .signin-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 32px var(--accent-glow); }
        .signin-btn:disabled { opacity:0.55; cursor:not-allowed; transform:none; }
        .spec-btn {
          width:100%; padding:12px; border-radius:10px;
          background:transparent; border:1.5px solid var(--border2);
          color:var(--text-muted); font-family:var(--font-body);
          font-size:13px; font-weight:600; cursor:pointer;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
          text-decoration:none; display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .spec-btn:hover { border-color:var(--accent2); color:var(--accent2); background:var(--accent2-glow); }
        .divider-text {
          display:flex; align-items:center; gap:12px;
          color:var(--text-dim); font-size:12px; margin:20px 0;
        }
        .divider-text::before,.divider-text::after {
          content:''; flex:1; height:1px; background:var(--border);
        }
      `}</style>

      {/* Glowing blobs */}
      <div style={{ position:'fixed', top:-160, left:-160, width:520, height:520, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,106,247,0.14) 0%, transparent 65%)', animation:'drift1 9s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', bottom:-140, right:-140, width:480, height:480, borderRadius:'50%', background:'radial-gradient(circle, rgba(224,95,255,0.1) 0%, transparent 65%)', animation:'drift2 11s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', top:'40%', right:'20%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,106,247,0.06) 0%, transparent 65%)', animation:'drift3 7s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />

      {/* Animated grid */}
      <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize:'48px 48px', animation:'gridFade 6s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />

      {/* Floating sport emoji */}
      {[
        { icon:'🏏', top:'12%',  left:'7%',  size:52, delay:'0s',    anim:'floatIcon'  },
        { icon:'⚽', top:'70%',  left:'5%',  size:44, delay:'1.5s',  anim:'floatIcon2' },
        { icon:'🏆', top:'25%',  right:'6%', size:48, delay:'0.8s',  anim:'floatIcon'  },
        { icon:'🎯', bottom:'20%',right:'8%',size:40, delay:'2.2s',  anim:'floatIcon2' },
        { icon:'⚡', top:'55%',  left:'3%',  size:36, delay:'3s',    anim:'floatIcon'  },
      ].map((f,i) => (
        <div key={i} style={{ position:'fixed', top:f.top, bottom:f.bottom, left:f.left, right:f.right, fontSize:f.size, animation:`${f.anim} ${3.5+i*0.5}s ease-in-out ${f.delay} infinite`, pointerEvents:'none', zIndex:0, userSelect:'none' }}>{f.icon}</div>
      ))}

      {/* ── Left panel — branding ── */}
      <div style={{ display:'none', flex:'0 0 46%', flexDirection:'column', justifyContent:'center', padding:'60px 56px', position:'relative', zIndex:1, borderRight:'1px solid var(--border)' }} className="auth-left-panel">
        <div style={{ marginBottom:48 }}>
          <div style={{ fontFamily:'var(--font-head)', fontSize:'4.5rem', lineHeight:1, letterSpacing:'-0.01em', marginBottom:16 }}>
            <span style={{ color:'var(--accent)' }}>GO</span>
            <span style={{ color:'var(--text)' }}>SPORT</span>
          </div>
          <p style={{ color:'var(--text-muted)', fontSize:16, lineHeight:1.6, maxWidth:340 }}>
            The complete sports management platform for athletes, admins, and fans.
          </p>
        </div>
        {[
          { icon:'📊', title:'Live Scorecards', desc:'Real-time match scores powered by WebSockets' },
          { icon:'🤖', title:'AI Squad Picks',  desc:'Heuristic-driven best-XI suggestions'         },
          { icon:'🏅', title:'Career Stats',    desc:'Detailed cricket & football performance history' },
        ].map((f,i) => (
          <div key={i} style={{ display:'flex', gap:14, marginBottom:24, alignItems:'flex-start' }}>
            <div style={{ width:40, height:40, borderRadius:10, background:'var(--accent-glow)', border:'1px solid var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{f.icon}</div>
            <div>
              <p style={{ fontWeight:700, fontSize:14, marginBottom:3 }}>{f.title}</p>
              <p style={{ color:'var(--text-muted)', fontSize:12, lineHeight:1.5 }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Right panel — form ── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px', position:'relative', zIndex:1 }}>
        <div style={{ width:'100%', maxWidth:400 }}>

          {/* Logo (mobile / single-column) */}
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ position:'relative', display:'inline-block' }}>
              <div style={{ fontFamily:'var(--font-head)', fontSize:'3.2rem', lineHeight:1, letterSpacing:'-0.01em' }}>
                <span style={{ color:'var(--accent)' }}>GO</span>
                <span style={{ color:'var(--text)' }}>SPORT</span>
              </div>
              {/* Glow ring under logo */}
              <div style={{ position:'absolute', bottom:-6, left:'50%', transform:'translateX(-50%)', width:'80%', height:3, borderRadius:2, background:'linear-gradient(90deg, transparent, var(--accent), var(--accent2), transparent)', animation:'pulseRing 2.5s ease-in-out infinite' }} />
            </div>
            <p style={{ color:'var(--text-muted)', marginTop:16, fontSize:13 }}>
              Sign in to access live scores, stats & more
            </p>
          </div>

          {/* Success banner */}
          {registered && (
            <div style={{ background:'rgba(76,218,127,0.1)', border:'1px solid #4cda7f', borderRadius:10, padding:'12px 16px', marginBottom:20, color:'#4cda7f', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:8 }}>
              ✓ Account created successfully! Sign in to continue.
            </div>
          )}

          {/* Card */}
          <div style={{ background:'var(--card)', border:'1px solid var(--border2)', borderRadius:16, padding:28, backdropFilter:'blur(12px)', boxShadow:'0 24px 64px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)' }}>
            {/* Top gradient bar */}
            <div style={{ height:3, borderRadius:'2px 2px 0 0', background:'linear-gradient(90deg, var(--accent), var(--accent2))', margin:'-28px -28px 28px' }} />

            <h2 style={{ fontFamily:'var(--font-head)', fontSize:'1.5rem', marginBottom:4, letterSpacing:'0.01em' }}>Welcome back</h2>
            <p style={{ color:'var(--text-muted)', fontSize:12, marginBottom:24 }}>Enter your credentials to continue</p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom:16 }}>
                <label className="label" style={{ marginBottom:8 }}>Email address</label>
                <div className="input-wrap">
                  <span className="input-icon">✉️</span>
                  <input className="auth-input-fancy" type="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                </div>
              </div>
              <div style={{ marginBottom:20 }}>
                <label className="label" style={{ marginBottom:8 }}>Password</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input className="auth-input-fancy" type="password" placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
              </div>

              {error && (
                <div style={{ background:'rgba(224,85,85,0.1)', border:'1px solid var(--error)', borderRadius:8, padding:'10px 14px', marginBottom:16, color:'var(--error)', fontSize:13 }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" className="signin-btn" disabled={loading}>
                {loading ? '✦ Signing in...' : '→ Sign In'}
              </button>
            </form>

            <div className="divider-text">or</div>

            <Link to="/register/spectator" className="spec-btn">
              <span>👁️</span> Register as Spectator — it's free
            </Link>

            <p style={{ textAlign:'center', color:'var(--text-dim)', fontSize:11, marginTop:16, lineHeight:1.6 }}>
              Player or Admin? Your admin will provide credentials.
            </p>
          </div>

          {/* Footer hint */}
          <p style={{ textAlign:'center', marginTop:20, color:'var(--text-dim)', fontSize:11 }}>
            GoSport · Real-time Sports Platform
          </p>
        </div>
      </div>

    </div>
  );
}
