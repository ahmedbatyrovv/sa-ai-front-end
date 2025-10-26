// src/index.js (updated)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n'; // Initialize i18next early
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);