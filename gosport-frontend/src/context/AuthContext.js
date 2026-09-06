import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.removeItem('gosport_token');
    localStorage.removeItem('gosport_role');
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/auth/me');
        if (!cancelled && res.data.user) {
          setUser({ role: res.data.user.role, name: res.data.user.name });
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const loggedinUser = res.data.user;
    setUser({ role: loggedinUser.role, name: loggedinUser.name });
    return loggedinUser.role;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  };

  const resendVerification = async (email) => {
    const res = await api.post('/auth/resend-verification', { email });
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {
      // Still drop local session if the request fails.
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, resendVerification, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
