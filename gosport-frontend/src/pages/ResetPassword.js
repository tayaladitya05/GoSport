import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('This page needs a reset link from your email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { token, password });
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Could not reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @keyframes drift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-30px) scale(1.08); } }
        .auth-input-fancy {
          width:100%; padding:13px 16px 13px 44px;
          background: var(--card2); border: 1.5px solid var(--border);
          border-radius:10px; color:var(--text);
          font-family:var(--font-body); font-size:14px; outline:none;
        }
        .signin-btn {
          width:100%; padding:14px; border:none; border-radius:10px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color:#fff; font-family:var(--font-body); font-size:15px; font-weight:700;
          cursor:pointer;
        }
        .signin-btn:disabled { opacity:0.55; cursor:not-allowed; }
      `}</style>

      <div style={{ position:'fixed', top:-160, left:-160, width:520, height:520, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,106,247,0.14) 0%, transparent 65%)', animation:'drift1 9s ease-in-out infinite', pointerEvents:'none' }} />

      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px', position:'relative', zIndex:1 }}>
        <div style={{ width:'100%', maxWidth:400 }}>
          <Link to="/login" style={{ textDecoration:'none' }}>
            <div style={{ fontFamily:'var(--font-head)', fontSize:'3rem', lineHeight:1, textAlign:'center', marginBottom:28 }}>
              <span style={{ color:'var(--accent)' }}>GO</span>
              <span style={{ color:'var(--text)' }}>SPORT</span>
            </div>
          </Link>

          <div style={{ background:'var(--card)', border:'1px solid var(--border2)', borderRadius:16, padding:28 }}>
            <div style={{ height:3, borderRadius:'2px 2px 0 0', background:'linear-gradient(90deg, var(--accent), var(--accent2))', margin:'-28px -28px 28px' }} />
            <h2 style={{ fontFamily:'var(--font-head)', fontSize:'1.5rem', marginBottom:8 }}>Reset password</h2>
            <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:24 }}>Choose a new password for your account.</p>

            {success ? (
              <>
                <p style={{ color:'#4cda7f', fontSize:13, marginBottom:20 }}>{success}</p>
                <Link to="/login" className="btn btn-primary" style={{ display:'inline-block', textDecoration:'none' }}>
                  Sign in
                </Link>
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom:14, position:'relative' }}>
                  <span style={{ position:'absolute', left:14, top:12, opacity:0.5 }}>🔒</span>
                  <input className="auth-input-fancy" type="password" placeholder="New password"
                    value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <div style={{ marginBottom:16, position:'relative' }}>
                  <span style={{ position:'absolute', left:14, top:12, opacity:0.5 }}>✅</span>
                  <input className="auth-input-fancy" type="password" placeholder="Confirm password"
                    value={confirm} onChange={e => setConfirm(e.target.value)} required />
                </div>

                {error && (
                  <div style={{ background:'rgba(224,85,85,0.1)', border:'1px solid var(--error)', borderRadius:8, padding:'10px 14px', marginBottom:16, color:'var(--error)', fontSize:13 }}>
                    ⚠️ {error}
                  </div>
                )}

                <button type="submit" className="signin-btn" disabled={loading || !token}>
                  {loading ? 'Saving…' : 'Update password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
