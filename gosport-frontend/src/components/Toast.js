import React, { useState, useCallback, useRef } from 'react';

let _showToast = null;

export function useToast() {
  return { showToast: (msg, type = 'info') => _showToast && _showToast(msg, type) };
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  _showToast = useCallback((msg, type = 'info') => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
      ))}
    </div>
  );
}
