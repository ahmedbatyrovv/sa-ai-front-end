// App.js
import { useState, useRef, useEffect, useMemo } from 'react';
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
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [showChatList, setShowChatList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('mostly'); // Изменено на 'mostly' по умолчанию
  const [language, setLanguage] = useState('en');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const t = (key) => {
    const translations = {
      en: {
        'new-chat': 'New Chat',
        'clear-conversation': 'Clear Conversation',
        'chat-history': 'Chat History',
        'search-chats': 'Search chats...',
        'no-chats': 'No chats yet. Start a new conversation!',
        'no-chats-found': 'No chats found.',
        'untitled': 'Untitled',
        'settings': 'Settings',
        'profile': 'Profile',
        'toggle-sidebar': 'Toggle Sidebar',
        'theme': 'Theme',
        'dark': 'Dark',
        'light': 'Light',
        'accent': 'Accent Color',
        'mostly': 'Mostly', // Новые labels
        'vitally': 'Vitally',
        'principally': 'Principally',
        'language': 'Language',
        'english': 'English',
        'russian': 'Russian',
        'logged-out': 'Logged out successfully',
        'conversation-cleared': 'Conversation cleared',
        'settings-opened': 'Settings opened',
        'logout': 'Logout',
        'what-do-you-want': 'What do you want to know?',
        'suggestions': [
          { text: 'What can you help me with?', icon: 'search' },
          { text: 'Explain quantum computing', icon: 'news' },
          { text: 'Help me write code', icon: 'personas' }
        ],
        'ai-powered': 'AI-Powered'
      },
      ru: {
        'new-chat': 'Новый чат',
        'clear-conversation': 'Очистить разговор',
        'chat-history': 'История чатов',
        'search-chats': 'Поиск чатов...',
        'no-chats': 'Чатов пока нет. Начните новый разговор!',
        'no-chats-found': 'Чаты не найдены.',
        'untitled': 'Без названия',
        'settings': 'Настройки',
        'profile': 'Профиль',
        'toggle-sidebar': 'Переключить боковую панель',
        'theme': 'Тема',
        'dark': 'Тёмная',
        'light': 'Светлая',
        'accent': 'Цвет акцента',
        'mostly': 'Основной',
        'vitally': 'Жизненно важный',
        'principally': 'Принципиальный',
        'language': 'Язык',
        'english': 'Английский',
        'russian': 'Русский',
        'logged-out': 'Успешно вышли из аккаунта',
        'conversation-cleared': 'Разговор очищен',
        'settings-opened': 'Настройки открыты',
        'logout': 'Выход',
        'what-do-you-want': 'Что вы хотите узнать?',
        'suggestions': [
          { text: 'Чем вы можете помочь?', icon: 'search' },
          { text: 'Объясните квантовые вычисления', icon: 'news' },
          { text: 'Помогите написать код', icon: 'personas' }
        ],
        'ai-powered': 'На базе ИИ'
      }
    };
    return translations[language][key] || key;
  };

  const currentTitle = useMemo(() => {
    if (!currentChatId) return 'SA-AI';
    const chat = chats.find(c => c.id === currentChatId);
    return chat?.title || t('untitled');
  }, [chats, currentChatId, language]);

  useEffect(() => {
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
      const parsed = JSON.parse(savedChats);
      setChats(parsed);
      if (parsed.length > 0) {
        const lastChat = parsed[parsed.length - 1];
        setCurrentChatId(lastChat.id);
        setMessages(lastChat.messages || []);
      }
    }
  }, []);

  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      setChats(prevChats => {
        const updated = prevChats.map(c => {
          if (c.id === currentChatId) {
            let newTitle = c.title;
            if (newTitle === '' && messages.length >= 2) {
              newTitle = messages[0].text.substring(0, 50) + (messages[0].text.length > 50 ? '...' : '');
            }
            return { ...c, title: newTitle, messages: messages };
          }
          return c;
        });
        localStorage.setItem('chats', JSON.stringify(updated));
        return updated;
      });
    }
  }, [messages, currentChatId]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setTheme(savedTheme);
    const savedAccent = localStorage.getItem('accentColor');
    if (savedAccent) setAccentColor(savedAccent);
    const savedLang = localStorage.getItem('language');
    if (savedLang) setLanguage(savedLang);
  }, []);

  useEffect(() => {
    document.body.className = `${theme} accent-${accentColor}`;
    localStorage.setItem('theme', theme);
    localStorage.setItem('accentColor', accentColor);
    localStorage.setItem('language', language);
  }, [theme, accentColor, language]);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
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
    setToast({ message: t('logged-out'), type: 'info' });
    setUser(null);
    setMessages([]);
    setInput('');
    setShowSettings(false);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setInput('');
    setStreamingMessage('');
    setShowChatList(false);
  };

  const handleClearChat = () => {
    setMessages([]);
    setInput('');
    setStreamingMessage('');
    setToast({ message: t('conversation-cleared'), type: 'info' });
  };

  const handleSettings = () => {
    setShowSettings(true);
    setToast({ message: t('settings-opened'), type: 'info' });
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleAccentChange = (newAccent) => {
    setAccentColor(newAccent);
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    if (!currentChatId) {
      const newId = Date.now();
      const newChat = { id: newId, title: '', messages: [] };
      setCurrentChatId(newId);
      setChats(prev => {
        const newList = [newChat, ...prev];
        localStorage.setItem('chats', JSON.stringify(newList));
        return newList;
      });
    }

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

      setMessages((prev) => [...prev, aiMessage]);
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

  const suggestions = t('suggestions');

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    return chats.filter(chat => {
      const titleMatch = chat.title.toLowerCase().includes(searchQuery.toLowerCase());
      const previewMatch = chat.messages.length > 0 && 
        chat.messages[chat.messages.length - 1].text.toLowerCase().includes(searchQuery.toLowerCase());
      return titleMatch || previewMatch;
    });
  }, [chats, searchQuery]);

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

  const headerTitle = !currentChatId ? 'SA-AI' : currentTitle;

  if (showSettings) {
    return (
      <div className={`app ${theme} accent-${accentColor}`}>
        <div className="settings-screen">
          <header className="settings-header">
            <button className="back-btn" onClick={() => setShowSettings(false)}>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1>{t('settings')}</h1>
            <div className="ai-badge">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </header>
          <main className="settings-content">
            <div className="settings-section">
              <h2>{t('theme')}</h2>
              <div className="theme-toggle-slider">
                <button 
                  className={`slider-btn ${theme === 'light' ? 'active' : ''}`} 
                  onClick={handleThemeToggle}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="sun-icon">
                    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2"/>
                    <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2"/>
                    <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
                <div className="slider-track">
                  <div className={`slider-thumb ${theme === 'dark' ? 'dark-active' : 'light-active'}`} onClick={handleThemeToggle}></div>
                </div>
                <button 
                  className={`slider-btn ${theme === 'dark' ? 'active' : ''}`} 
                  onClick={handleThemeToggle}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="moon-icon">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="settings-section">
              <h2>{t('accent')}</h2>
              <div className="accent-selector">
                <button 
                  className={`accent-btn ${accentColor === 'mostly' ? 'active' : ''}`} 
                  onClick={() => handleAccentChange('mostly')}
                  style={{ '--accent-btn-color': '#2d72e2' }} // mostly
                >
                  <div className="accent-color-swatch"></div>
                </button>
                <button 
                  className={`accent-btn ${accentColor === 'vitally' ? 'active' : ''}`} 
                  onClick={() => handleAccentChange('vitally')}
                  style={{ '--accent-btn-color': '#8A4FFF' }} // vitally
                >
                  <div className="accent-color-swatch"></div>
                </button>
                <button 
                  className={`accent-btn ${accentColor === 'principally' ? 'active' : ''}`} 
                  onClick={() => handleAccentChange('principally')}
                  style={{ '--accent-btn-color': '#ffb464' }} // principally (новая)
                >
                  <div className="accent-color-swatch"></div>
                </button>
              </div>
            </div>
            <div className="settings-section">
              <h2>{t('language')}</h2>
              <select value={language} onChange={e => handleLanguageChange(e.target.value)}>
                <option value="en">{t('english')}</option>
                <option value="ru">{t('russian')}</option>
              </select>
            </div>
            <button className="logout-btn" onClick={handleLogout}>{t('logout')}</button>
          </main>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className={`app ${theme} accent-${accentColor}`}>
      <aside className={`sidebar ${showChatList ? 'sidebar-wide' : ''} ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-nav">
          <button 
            className={`sidebar-icon ${!currentChatId ? 'active' : ''}`} 
            onClick={handleNewChat} 
            data-tooltip="SA-AI"
          >
            <svg viewBox="0 0 24 24" fill="none" className="ai-home-icon">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              {/* AI Neural Network Overlay for Home */}
              <circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.3"/>
              <circle cx="8" cy="8" r="0.5" fill="currentColor" opacity="0.3"/>
              <circle cx="16" cy="8" r="0.5" fill="currentColor" opacity="0.3"/>
              <circle cx="8" cy="16" r="0.5" fill="currentColor" opacity="0.3"/>
              <circle cx="16" cy="16" r="0.5" fill="currentColor" opacity="0.3"/>
            </svg>
            {showChatList && <span className="icon-label">SA-AI</span>}
          </button>
          <button 
            className="sidebar-icon" 
            onClick={handleNewChat} 
            data-tooltip={t('new-chat')}
          >
            <svg viewBox="0 0 24 24" fill="none" className="ai-chat-icon">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              {/* AI Sparkle for New Chat */}
              <circle cx="12" cy="3" r="1" fill="currentColor" opacity="0.6"/>
              <path d="M12 3L10 1M12 3L14 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
            </svg>
            {showChatList && <span className="icon-label">{t('new-chat')}</span>}
          </button>
          <button 
            className={`sidebar-icon ${showChatList ? 'active' : ''}`} 
            onClick={() => setShowChatList(!showChatList)} 
            data-tooltip={t('chat-history')}
          >
            <svg viewBox="0 0 24 24" fill="none" className="ai-history-icon">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              {/* AI Timeline Dots */}
              <circle cx="5" cy="6" r="1" fill="currentColor" opacity="0.4"/>
              <circle cx="19" cy="6" r="1" fill="currentColor" opacity="0.4"/>
            </svg>
            {showChatList && <span className="icon-label">{t('chat-history')}</span>}
          </button>
          <button 
            className="sidebar-icon" 
            onClick={handleSettings} 
            data-tooltip={t('settings')}
          >
            <svg viewBox="0 0 24 24" fill="none" className="ai-settings-icon">
              <path d="m20.91 10.29-3.37-1.86a1.68 1.68 0 0 0-2.04.39l-1.17 2.02a1.68 1.68 0 0 1-2.04.39l-1.17-2.02a1.68 1.68 0 0 0-2.04-.39L6.46 10.29a1.68 1.68 0 0 0-.39 2.04l1.17 2.02a1.68 1.68 0 0 1 .39 2.04l-1.17 2.02a1.68 1.68 0 0 0 .39 2.04l3.37 1.86a1.68 1.68 0 0 0 2.04-.39l1.17-2.02a1.68 1.68 0 0 1 2.04-.39l1.17 2.02a1.68 1.68 0 0 0 2.04.39l3.37-1.86a1.68 1.68 0 0 0-.39-2.04l-1.17-2.02a1.68 1.68 0 0 1-.39-2.04l1.17-2.02a1.68 1.68 0 0 0 .39-2.04zM12 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              {/* AI Gear Neural Accent */}
              <circle cx="12" cy="13" r="0.5" fill="currentColor" opacity="0.5"/>
            </svg>
            {showChatList && <span className="icon-label">{t('settings')}</span>}
          </button>
        </div>
        <div className="sidebar-content">
          {showChatList && (
            <div className="chat-list">
              <div className="chat-search">
                <svg viewBox="0 0 24 24" fill="none" className="search-icon">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input 
                  type="text" 
                  placeholder={t('search-chats')} 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  className="search-input"
                />
              </div>
              {filteredChats.length === 0 ? (
                <div className="no-chats">
                  {searchQuery ? t('no-chats-found') : t('no-chats')}
                </div>
              ) : (
                filteredChats.slice().reverse().map((chat) => (
                  <button
                    key={chat.id}
                    className={`chat-item ${chat.id === currentChatId ? 'active' : ''}`}
                    onClick={() => {
                      setMessages(chat.messages || []);
                      setCurrentChatId(chat.id);
                      if (isMobile) setShowChatList(false);
                    }}
                  >
                    <div className="chat-title">{chat.title || t('untitled')}</div>
                    {chat.messages.length > 0 && (
                      <div className="chat-preview">
                        {chat.messages[chat.messages.length - 1].text.substring(0, 50)}...
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <div className="sidebar-spacer"></div>
        <div className="sidebar-footer">
          <button 
            className={`sidebar-icon sidebar-profile ${showChatList ? 'profile-wide-item' : ''}`} 
            data-tooltip={user?.name || t('profile')} 
          >
            {!showChatList ? (
              <div className="profile-initial">
                <div className="user-avatar">{userInitial}</div>
              </div>
            ) : (
              <div className="profile-wide">
                <div className="profile-avatar">
                  <div className="user-avatar">{userInitial}</div>
                </div>
                <div className="profile-info">
                  <span className="profile-name">{user?.name || t('profile')}</span>
                  <span className="profile-subtitle">{t('ai-powered')}</span>
                </div>
              </div>
            )}
          </button>
          <button 
            className="sidebar-icon sidebar-toggle" 
            onClick={() => setShowChatList(!showChatList)} 
            data-tooltip={t('toggle-sidebar')}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {showChatList && <span className="icon-label">{t('toggle-sidebar')}</span>}
          </button>
        </div>
      </aside>
      {isMobile && sidebarOpen && <div className="backdrop" onClick={() => setSidebarOpen(false)} />}
      <div className="main-wrapper">
        <main className="main-content">
          {isMobile && (
            <header className="mobile-header">
              <button className="menu-toggle" onClick={() => setSidebarOpen(prev => !prev)}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <div className="current-chat-info">
                <h2>{headerTitle}</h2>
                {currentChatId && (
                  <button className="new-chat-mobile" onClick={handleNewChat}>
                    {t('new-chat')}
                  </button>
                )}
              </div>
            </header>
          )}
          <div className="chat-container">
            {messages.length === 0 && !streamingMessage ? (
              <div className="welcome-screen">
                <div className="welcome-logo">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <h1>SA-AI</h1>
                </div>
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
              placeholder={t('what-do-you-want')}
              className="chat-input"
              rows="1"
              disabled={isTyping}
            />
            <div className="input-actions">
              <button className="model-selector">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>SA-AI</span>
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
        </footer>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;