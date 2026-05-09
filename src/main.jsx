import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Apply saved theme
const savedTheme = localStorage.getItem('nagarvoice_theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// Clear old cached issues on version update so new mock data takes effect
const APP_VERSION = '2.0.0';
if (localStorage.getItem('nagarvoice_version') !== APP_VERSION) {
  localStorage.removeItem('nagarvoice_issues');
  localStorage.removeItem('nagarvoice_notifications');
  localStorage.setItem('nagarvoice_version', APP_VERSION);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
