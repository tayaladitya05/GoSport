import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('gosport_token');
    const storedRole = localStorage.getItem('gosport_role');
    if (storedToken && storedRole) {
      setToken(storedToken);
      setUser({ role: storedRole });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: t, role } = res.data;
    setToken(t);
    setUser({ role });
    localStorage.setItem('gosport_token', t);
    localStorage.setItem('gosport_role', role);
    return role;
  };

  const register = async (data) => {
    await api.post('/auth/register', data);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('gosport_token');
    localStorage.removeItem('gosport_role');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
