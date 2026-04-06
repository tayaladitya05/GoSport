import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login        from './pages/Login';
import Register     from './pages/Register';
import SpectatorReg from './pages/SpectatorRegister';
import Dashboard    from './pages/Dashboard';
import Matches      from './pages/Matches';
import MatchDetail  from './pages/MatchDetail';
import CreateMatch  from './pages/CreateMatch';
import Players      from './pages/Players';
import PlayerStats  from './pages/PlayerStats';
import MyStats      from './pages/MyStats';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Public pages — login and spectator self-registration only */}
              <Route path="/login"             element={<Login />} />
              <Route path="/register/spectator" element={<SpectatorReg />} />

              {/* Change 1: /matches and /matches/:id require login */}
              <Route path="/matches" element={
                <ProtectedRoute><Matches /></ProtectedRoute>
              } />
              <Route path="/matches/:id" element={
                <ProtectedRoute><MatchDetail /></ProtectedRoute>
              } />

              {/* Change 2: /register (admin panel) — admin only, no spectator option */}
              <Route path="/register" element={
                <ProtectedRoute roles={['admin']}><Register /></ProtectedRoute>
              } />

              {/* All logged-in users */}
              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />

              {/* Player only */}
              <Route path="/my-stats" element={
                <ProtectedRoute roles={['player']}><MyStats /></ProtectedRoute>
              } />

              {/* Admin only */}
              <Route path="/matches/create" element={
                <ProtectedRoute roles={['admin']}><CreateMatch /></ProtectedRoute>
              } />

              {/* All authenticated roles can view players & stats */}
              <Route path="/players" element={
                <ProtectedRoute roles={['admin', 'player', 'spectator']}><Players /></ProtectedRoute>
              } />
              <Route path="/players/:id/stats" element={
                <ProtectedRoute roles={['admin', 'player', 'spectator']}><PlayerStats /></ProtectedRoute>
              } />

              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
