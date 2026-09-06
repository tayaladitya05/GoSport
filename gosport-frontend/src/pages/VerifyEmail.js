import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState(token ? 'verifying' : 'missing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await api.post('/auth/verify-email', { token });
        if (!cancelled) {
          setStatus('success');
          setMessage(res.data.message || 'Email verified. You can now sign in.');
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setMessage(
            err.response?.data?.message ||
            err.response?.data?.error ||
            'This verification link is invalid or has expired.'
          );
        }
      }
    })();

    return () => { cancelled = true; };
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @keyframes drift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-30px) scale(1.08); } }
        @keyframes pulseRing { 0%,100%{ transform:translate(-50%,0) scale(1); opacity:0.5; } 50%{ transform:translate(-50%,0) scale(1.04); opacity:1; } }
      `}</style>

      <div style={{ position:'fixed', top:-160, left:-160, width:520, height:520, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,106,247,0.14) 0%, transparent 65%)', animation:'drift1 9s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />

      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px', position:'relative', zIndex:1 }}>
        <div style={{ width:'100%', maxWidth:420, textAlign:'center' }}>
          <Link to="/login" style={{ textDecoration:'none' }}>
            <div style={{ fontFamily:'var(--font-head)', fontSize:'3rem', lineHeight:1, marginBottom:28 }}>
              <span style={{ color:'var(--accent)' }}>GO</span>
              <span style={{ color:'var(--text)' }}>SPORT</span>
            </div>
          </Link>

          <div style={{ background:'var(--card)', border:'1px solid var(--border2)', borderRadius:16, padding:32, boxShadow:'0 24px 64px rgba(0,0,0,0.3)' }}>
            <div style={{ height:3, borderRadius:'2px 2px 0 0', background:'linear-gradient(90deg, var(--accent), var(--accent2))', margin:'-32px -32px 28px' }} />

            {status === 'verifying' && (
              <>
                <p style={{ fontSize:28, marginBottom:12 }}>✉️</p>
                <h2 style={{ fontFamily:'var(--font-head)', fontSize:'1.4rem', marginBottom:8 }}>Verifying your email</h2>
                <p style={{ color:'var(--text-muted)', fontSize:13 }}>Please wait a moment…</p>
              </>
            )}

            {status === 'success' && (
              <>
                <p style={{ fontSize:28, marginBottom:12 }}>✓</p>
                <h2 style={{ fontFamily:'var(--font-head)', fontSize:'1.4rem', marginBottom:8 }}>Email verified</h2>
                <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:24, lineHeight:1.5 }}>{message}</p>
                <Link to="/login" className="btn btn-primary" style={{ display:'inline-block', textDecoration:'none' }}>
                  Sign in
                </Link>
              </>
            )}

            {(status === 'error' || status === 'missing') && (
              <>
                <p style={{ fontSize:28, marginBottom:12 }}>⚠️</p>
                <h2 style={{ fontFamily:'var(--font-head)', fontSize:'1.4rem', marginBottom:8 }}>Could not verify</h2>
                <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:24, lineHeight:1.5 }}>
                  {status === 'missing' ? 'This page needs a verification link from your email.' : message}
                </p>
                <Link to="/login" style={{ color:'var(--accent)', fontWeight:700, fontSize:13 }}>
                  Back to sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
