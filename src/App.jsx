import { useState, useRef, useEffect } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Toast from './components/Toast';
import { generateStreamingResponse } from './services/aiService';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [toast, setToast] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleSignup = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setToast({ message: 'Logged out successfully', type: 'info' });  // Устанавливаем toast ДО setUser(null)
    setUser(null);  // Теперь переключаемся на login/signup, но toast отобразится там
    setMessages([]);
    setInput('');
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setStreamingMessage('');

    try {
      await generateStreamingResponse(input, (chunk) => {
        setStreamingMessage(chunk);
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: streamingMessage,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, { ...aiMessage, text: streamingMessage }]);
      setStreamingMessage('');
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setStreamingMessage('');
  };

  const suggestions = [
    { text: 'What can you help me with?', icon: 'search' },
    { text: 'Explain quantum computing', icon: 'news' },
    { text: 'Help me write code', icon: 'personas' }
  ];

  if (!user) {
    if (authMode === 'login') {
      return (
        <Login 
          onLogin={handleLogin} 
          onSwitchToSignup={() => setAuthMode('signup')} 
          toast={toast} 
          setToast={setToast} 
        />
      );
    } else {
      return (
        <Signup 
          onSignup={handleSignup} 
          onSwitchToLogin={() => setAuthMode('login')} 
          toast={toast} 
          setToast={setToast} 
        />
      );
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <button className="sidebar-icon active" onClick={handleNewChat}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="sidebar-icon" onClick={handleNewChat}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="sidebar-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <button className="sidebar-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 20H21M3 20H7.5M7.5 20V4M7.5 20H12M7.5 4H3M7.5 4H12M12 4H21M12 4V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <button className="sidebar-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="sidebar-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="sidebar-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M3 9H21" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>
        <button className="sidebar-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>
        <div className="sidebar-spacer"></div>
        <button className="sidebar-icon sidebar-profile">
          <div className="profile-initial">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
        </button>
        <button className="sidebar-icon" onClick={handleLogout} title="Logout">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </aside>

      <div className="main-wrapper">
        <main className="main-content">
          <div className="chat-container">
            {messages.length === 0 && !streamingMessage ? (
              <div className="welcome-screen">
                <div className="welcome-logo">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <h1>Grok</h1>
                </div>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map((message) => (
                  <div key={message.id} className={`message ${message.sender}`}>
                    <div className="message-avatar">
                      {message.sender === 'ai' ? (
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <div className="user-avatar">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
                      )}
                    </div>
                    <div className="message-content">
                      <p className="message-text">{message.text}</p>
                    </div>
                  </div>
                ))}
                {(isTyping || streamingMessage) && (
                  <div className="message ai">
                    <div className="message-avatar">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="message-content">
                      {streamingMessage ? (
                        <p className="message-text">{streamingMessage}<span className="cursor">|</span></p>
                      ) : (
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </main>

        <footer className="footer">
          <div className="input-wrapper">
            <button className="attach-btn">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59723 21.9983 8.005 21.9983C6.41277 21.9983 4.88584 21.3658 3.76 20.24C2.63416 19.1142 2.00166 17.5872 2.00166 15.995C2.00166 14.4028 2.63416 12.8758 3.76 11.75L12.33 3.18C13.0806 2.42944 14.0991 2.00558 15.16 2.00558C16.2209 2.00558 17.2394 2.42944 17.99 3.18C18.7406 3.93056 19.1644 4.94908 19.1644 6.01C19.1644 7.07092 18.7406 8.08944 17.99 8.84L9.41 17.41C9.03472 17.7853 8.52542 17.9972 7.995 17.9972C7.46458 17.9972 6.95528 17.7853 6.58 17.41C6.20472 17.0347 5.99283 16.5254 5.99283 15.995C5.99283 15.4646 6.20472 14.9553 6.58 14.58L14.5 6.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What do you want to know?"
              className="chat-input"
              rows="1"
              disabled={isTyping}
            />
            <div className="input-actions">
              <button className="model-selector">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Grok AI</span>
                <svg viewBox="0 0 24 24" fill="none" className="chevron">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                className="voice-btn"
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 8L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          {messages.length === 0 && (
            <div className="suggestions">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-chip"
                  onClick={() => setInput(suggestion.text)}
                >
                  {suggestion.icon === 'search' && (
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                  {suggestion.icon === 'news' && (
                    <svg viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M3 9H21M9 21V9" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                  {suggestion.icon === 'personas' && (
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                      <path d="M5 20C5 16.134 8.134 13 12 13C15.866 13 19 16.134 19 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                  <span>{suggestion.text}</span>
                </button>
              ))}
            </div>
          )}
        </footer>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}  {/* Toast для главной страницы */}
    </div>
  );
}

export default App;