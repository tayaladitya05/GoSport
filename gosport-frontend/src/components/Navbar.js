import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggle } = useTheme();

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname.startsWith(path);

  // Change 1: no nav links shown to unauthenticated users
  const navLinks = !user
    ? [] // guests see no nav links — they must sign in
    : user.role === 'admin'
    ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/matches',   label: 'Matches'   },
        { to: '/players',   label: 'Players'   },
      ]
    : user.role === 'player'
    ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/matches',   label: 'Matches'   },
        { to: '/my-stats',  label: 'My Stats'  },
      ]
    : user.role === 'spectator'
    ? [
        { to: '/dashboard', label: 'Dashboard'   },
        { to: '/matches',   label: 'Live Scores' },
        { to: '/players',   label: 'Player Stats'},
      ]
    : [];

  return (
    <nav style={{
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '0 20px',
        height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo — goes to login if not signed in */}
        <Link to={user ? '/dashboard' : '/login'} style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-head)', fontSize: '1.6rem', letterSpacing: '0.02em' }}>
            <span style={{ color: 'var(--accent)' }}>GO</span>
            <span style={{ color: 'var(--text)'   }}>SPORT</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{
              padding: '6px 14px', borderRadius: 7, fontSize: 14, fontWeight: 600,
              color:      isActive(link.to) ? 'var(--accent)' : 'var(--text-muted)',
              background: isActive(link.to) ? 'var(--accent-glow)' : 'transparent',
              transition: 'all 0.15s',
            }}>{link.label}</Link>
          ))}

          {navLinks.length > 0 && (
            <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 8px' }} />
          )}

          {/* Theme toggle — always visible */}
          <button onClick={toggle} className="theme-toggle" title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 4 }}>
              <span style={{
                background: 'var(--accent-glow)', border: '1px solid var(--accent)',
                borderRadius: 20, padding: '3px 12px', fontSize: 11,
                color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>{user.role}</span>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
            </div>
          ) : (
            /* Change 1: guests only see Sign In — no public "Live Scores" link */
            <div style={{ marginLeft: 4 }}>
              <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
