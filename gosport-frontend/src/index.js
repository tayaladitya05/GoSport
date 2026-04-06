import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Apply saved theme before render to avoid flash
const savedTheme = localStorage.getItem('gosport_theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
