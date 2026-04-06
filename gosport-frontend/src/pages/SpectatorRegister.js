import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SpectatorRegister() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6)       { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register({ name:form.name, email:form.email, password:form.password, role:'spectator' });
      navigate('/login', { state:{ registered:true } });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const perks = [
    { icon:'📺', text:'Watch live match scoreboards update in real-time' },
    { icon:'📊', text:'Browse full player career statistics'              },
    { icon:'🤖', text:'See AI-generated squad recommendations'            },
    { icon:'🔔', text:'Follow cricket & football matches together'        },
  ];

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--bg)', overflow:'hidden', position:'relative' }}>

      <style>{`
        @keyframes drift1  { 0%,100%{ transform:translate(0,0) scale(1); } 50%{ transform:translate(40px,-30px) scale(1.08); } }
        @keyframes drift2  { 0%,100%{ transform:translate(0,0) scale(1); } 50%{ transform:translate(-30px,40px) scale(1.05); } }
        @keyframes gridFade{ 0%,100%{ opacity:0.03; } 50%{ opacity:0.07; } }
        @keyframes floatIcon { 0%,100%{ transform:translateY(0px) rotate(0deg); opacity:0.07; } 50%{ transform:translateY(-18px) rotate(8deg); opacity:0.13; } }
        @keyframes floatIcon2{ 0%,100%{ transform:translateY(0px) rotate(0deg); opacity:0.06; } 50%{ transform:translateY(-22px) rotate(-6deg); opacity:0.11; } }
        @keyframes shimmer  { 0%{ background-position:-200% center; } 100%{ background-position:200% center; } }
        @keyframes pulseRing{ 0%,100%{ transform:translate(-50%,0) scale(1); opacity:0.5; } 50%{ transform:translate(-50%,0) scale(1.04); opacity:1; } }
        @keyframes checkIn  { 0%{ opacity:0; transform:scale(0.5); } 100%{ opacity:1; transform:scale(1); } }
        .sreg-input {
          width:100%; padding:12px 16px 12px 44px;
          background:var(--card2); border:1.5px solid var(--border);
          border-radius:10px; color:var(--text);
          font-family:var(--font-body); font-size:14px;
          transition:border-color 0.2s, box-shadow 0.2s, background 0.2s; outline:none;
        }
        .sreg-input::placeholder { color:var(--text-dim); }
        .sreg-input:focus { border-color:var(--accent2); box-shadow:0 0 0 3px var(--accent2-glow); background:var(--card); }
        .sreg-submit {
          width:100%; padding:14px; border:none; border-radius:10px;
          background:linear-gradient(135deg, var(--accent2), var(--accent));
          color:#fff; font-family:var(--font-body); font-size:15px; font-weight:700;
          cursor:pointer; letter-spacing:0.03em;
          transition:opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow:0 4px 24px var(--accent2-glow); position:relative; overflow:hidden;
        }
        .sreg-submit::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent); background-size:200% 100%; animation:shimmer 2.4s linear infinite; }
        .sreg-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 32px var(--accent2-glow); }
        .sreg-submit:disabled { opacity:0.55; cursor:not-allowed; transform:none; }
        .perk-row { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--border); }
        .perk-row:last-child { border-bottom:none; }
      `}</style>

      {/* Animated blobs */}
      <div style={{ position:'fixed', top:-160, right:-160, width:520, height:520, borderRadius:'50%', background:'radial-gradient(circle, rgba(224,95,255,0.12) 0%, transparent 65%)', animation:'drift1 9s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', bottom:-140, left:-140, width:480, height:480, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,106,247,0.1) 0%, transparent 65%)', animation:'drift2 11s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />

      {/* Animated grid */}
      <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(var(--border) 1px, transparent 1px),linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize:'48px 48px', animation:'gridFade 6s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />

      {/* Floating icons */}
      {[
        { icon:'👁️', top:'10%',  left:'6%',   size:46, delay:'0s',   anim:'floatIcon'  },
        { icon:'🏏',  top:'65%',  left:'4%',   size:42, delay:'1.8s', anim:'floatIcon2' },
        { icon:'⚽',  top:'20%',  right:'5%',  size:44, delay:'0.6s', anim:'floatIcon'  },
        { icon:'🏆',  bottom:'15%',right:'7%', size:40, delay:'2.5s', anim:'floatIcon2' },
      ].map((f,i) => (
        <div key={i} style={{ position:'fixed', top:f.top, bottom:f.bottom, left:f.left, right:f.right, fontSize:f.size, animation:`${f.anim} ${3.5+i*0.6}s ease-in-out ${f.delay} infinite`, pointerEvents:'none', zIndex:0, userSelect:'none' }}>{f.icon}</div>
      ))}

      {/* ── Layout ── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px', position:'relative', zIndex:1 }}>
        <div style={{ width:'100%', maxWidth:440 }}>

          {/* Logo */}
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <Link to="/login" style={{ display:'inline-block', textDecoration:'none' }}>
              <div style={{ position:'relative', display:'inline-block' }}>
                <div style={{ fontFamily:'var(--font-head)', fontSize:'3rem', lineHeight:1, letterSpacing:'-0.01em' }}>
                  <span style={{ color:'var(--accent)' }}>GO</span>
                  <span style={{ color:'var(--text)' }}>SPORT</span>
                </div>
                <div style={{ position:'absolute', bottom:-4, left:'50%', width:'80%', height:2, borderRadius:2, background:'linear-gradient(90deg, transparent, var(--accent2), var(--accent), transparent)', animation:'pulseRing 2.5s ease-in-out infinite' }} />
              </div>
            </Link>
            <p style={{ color:'var(--text-muted)', marginTop:14, fontSize:13 }}>
              Create a free spectator account
            </p>
          </div>

          {/* Role pill */}
          <div style={{ textAlign:'center', marginBottom:20 }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 18px', borderRadius:20, background:'linear-gradient(135deg, var(--accent2-glow), var(--accent-glow))', border:'1px solid var(--accent2)', fontSize:12, color:'var(--accent2)', fontWeight:700, letterSpacing:'0.07em' }}>
              👁️ &nbsp;SPECTATOR REGISTRATION
            </span>
          </div>

          {/* Main card */}
          <div style={{ background:'var(--card)', border:'1px solid var(--border2)', borderRadius:16, padding:28, boxShadow:'0 24px 64px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)' }}>
            <div style={{ height:3, borderRadius:'2px 2px 0 0', background:'linear-gradient(90deg, var(--accent2), var(--accent))', margin:'-28px -28px 24px' }} />

            {/* Perks strip */}
            <div style={{ background:'var(--card2)', borderRadius:10, padding:'12px 16px', marginBottom:22, border:'1px solid var(--border)' }}>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:8 }}>What you get</p>
              {perks.map((p,i) => (
                <div key={i} className="perk-row">
                  <span style={{ fontSize:16, flexShrink:0 }}>{p.icon}</span>
                  <span style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.4 }}>{p.text}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {[
                { k:'name',    label:'Full Name',       type:'text',     placeholder:'Your name',       icon:'👤' },
                { k:'email',   label:'Email',            type:'email',    placeholder:'you@example.com', icon:'✉️' },
                { k:'password',label:'Password',         type:'password', placeholder:'Min. 6 characters',icon:'🔒'},
                { k:'confirm', label:'Confirm Password', type:'password', placeholder:'Repeat password',  icon:'✅'},
              ].map(f => (
                <div key={f.k} style={{ marginBottom:14 }}>
                  <label className="label" style={{ marginBottom:6 }}>{f.label}</label>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:14, pointerEvents:'none', opacity:0.5 }}>{f.icon}</span>
                    <input className="sreg-input" type={f.type} placeholder={f.placeholder}
                      value={form[f.k]} onChange={e => set(f.k, e.target.value)} required />
                  </div>
                </div>
              ))}

              {error && (
                <div style={{ background:'rgba(224,85,85,0.1)', border:'1px solid var(--error)', borderRadius:8, padding:'10px 14px', marginBottom:14, color:'var(--error)', fontSize:13 }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" className="sreg-submit" disabled={loading} style={{ marginTop:6 }}>
                {loading ? '✦ Creating account...' : '→ Create Spectator Account'}
              </button>
            </form>
          </div>

          <p style={{ textAlign:'center', marginTop:18, color:'var(--text-muted)', fontSize:13 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--accent)', fontWeight:700 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
