import { useState } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';  // Импорт Toast
import './Auth.css';

function Signup({ onSignup, onSwitchToLogin, toast, setToast }) {  // Добавил пропсы toast/setToast
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [localToast, setLocalToast] = useState(null);  // Локальный toast

  const API_BASE = 'https://api.merdannotfound.ru';  // API URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Валидация на фронте
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/api/auth/register`, { name, email, password });  // Axios POST

      // Успех (response.data содержит ответ от бэкенда)
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
      setLocalToast({ message: 'Account created successfully! Welcome to Grok.', type: 'success' });
      setTimeout(() => {
        setLocalToast(null);
        if (onSignup) onSignup(response.data.user);
      }, 3000);
    } catch (err) {
      // Обработка ошибок Axios
      if (err.response && err.response.status === 400) {
        const errorMsg = err.response.data.errors ? err.response.data.errors[0]?.msg || 'Validation error' : err.response.data.message || 'Registration failed';
        setError(errorMsg);
      } else if (err.response && err.response.status === 500) {
        setError('Server error (500). Check backend logs.');
      } else {
        setError('Network error. Please try again. (API may be down)');
      }
      console.error('Signup error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
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
          <h2>Log in or sign up</h2>
          <p className="auth-subtitle">You'll get smarter responses and can upload files, images, and more.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="social-buttons">
          <button className="social-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          {/* Остальные social buttons без изменений... */}
        </div>

        <div className="divider">OR</div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" disabled={loading} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" disabled={loading} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" disabled={loading} />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" disabled={loading} />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Continue'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <button onClick={onSwitchToLogin} className="auth-link">Log in</button></p>
        </div>
      </div>
      {localToast && <Toast message={localToast.message} type={localToast.type} onClose={() => setLocalToast(null)} />}  {/* Локальный toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}  {/* Глобальный toast для logout */}
    </div>
  );
}

export default Signup;