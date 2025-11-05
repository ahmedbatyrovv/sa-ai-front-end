// src/pages/Login.jsx (no changes needed, but added fallback for t keys)
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Toast from '../components/Toast';
import './Auth.css';
function Login({ onLogin, onSwitchToSignup, toast, setToast }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [localToast, setLocalToast] = useState(null);
  const API_BASE = 'https://api.merdannotfound.ru';
  const capitalizeProvider = (provider) => provider.charAt(0).toUpperCase() + provider.slice(1);
  const handleSocialLogin = async (provider) => {
    setError('');
    setLocalToast({ message: t('coming-soon') || 'Coming Soon!', type: 'info' });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!email || !password) {
      setError(t('please-fill-all-fields') || 'Please fill in all fields');
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
      setLocalToast({ message: t('logged-in-success') || 'Logged in successfully', type: 'success' });
      setTimeout(() => {
        setLocalToast(null);
        if (onLogin) onLogin(response.data.user);
      }, 3000);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        const errorMsg = err.response.data.message || t('invalid-credentials') || 'Invalid credentials';
        setError(errorMsg);
      } else if (err.response && err.response.status === 500) {
        setError(t('server-error') || 'Server error');
      } else {
        setError(t('network-error') || 'Network error');
      }
      console.error('Login error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <div className="auth-container">
      <div className="auth-modal">
        <button className="auth-close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="auth-header">
          <h2>{t('log-in-or-sign-up') || 'Log in or sign up'}</h2>
          <p className="auth-subtitle">{t('auth-subtitle') || "You'll get smarter responses and can upload files, images, and more."}</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <div className="social-buttons">
          <button
            className="social-btn"
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {t('continue-with-google') || 'Continue with Google'}
          </button>
          <button
            className="social-btn"
            onClick={() => handleSocialLogin('github')}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            {t('continue-with-github') || 'Continue with GitHub'}
          </button>
          <button
            className="social-btn"
            onClick={() => handleSocialLogin('phone')}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            {t('continue-with-phone') || 'Continue with Phone Number'}
          </button>
        </div>
        <div className="divider">{t('or') || 'OR'}</div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>{t('email') || 'Email'}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('email-address') || 'Email address'} disabled={loading} />
          </div>
          <div className="form-group password-group">
            <label>{t('password') || 'Password'}</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('password') || 'Password'}
                disabled={loading}
              />
              <button type="button" className="password-toggle" onClick={togglePasswordVisibility} disabled={loading}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="eye-icon">
                  {showPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.95A7.02 7.02 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1 4.78 2.36m-9.94-3.43a9 9 0 0 1 1.97-3.18" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round"/>
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? t('signing-in') || 'Signing in...' : t('continue') || 'Continue'}
          </button>
        </form>
        <div className="auth-footer">
          <p>{t('dont-have-account') || "Don't have an account?"} <button onClick={onSwitchToSignup} className="auth-link">{t('sign-up') || 'Sign up'}</button></p>
        </div>
      </div>
      {localToast && <Toast message={localToast.message} type={localToast.type} onClose={() => setLocalToast(null)} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
export default Login;