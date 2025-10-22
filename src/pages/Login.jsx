import { useState } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';  // Импорт Toast
import './Auth.css';

function Login({ onLogin, onSwitchToSignup, toast, setToast }) {  // Добавил пропсы toast/setToast
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [localToast, setLocalToast] = useState(null);  // Локальный toast

  const API_BASE = 'https://api.merdannotfound.ru';  // API URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/api/auth/login`, { email, password });  // Axios POST

      // Успех
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
      setLocalToast({ message: 'Successfully logged in! Welcome back.', type: 'success' });
      setTimeout(() => {
        setLocalToast(null);
        if (onLogin) onLogin(response.data.user);
      }, 3000);
    } catch (err) {
      // Обработка ошибок Axios
      if (err.response && err.response.status === 400) {
        const errorMsg = err.response.data.message || 'Invalid email or password';
        setError(errorMsg);
      } else if (err.response && err.response.status === 500) {
        setError('Server error (500). Check backend logs.');
      } else {
        setError('Network error. Please try again. (API may be down)');
      }
      console.error('Login error:', err.response?.data || err.message);
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
          {/* Social buttons без изменений */}
        </div>

        <div className="divider">OR</div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" disabled={loading} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" disabled={loading} />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Continue'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <button onClick={onSwitchToSignup} className="auth-link">Sign up</button></p>
        </div>
      </div>
      {localToast && <Toast message={localToast.message} type={localToast.type} onClose={() => setLocalToast(null)} />}  {/* Локальный toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}  {/* Глобальный toast для logout */}
    </div>
  );
}

export default Login;