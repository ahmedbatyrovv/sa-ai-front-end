// src/AppContent.jsx
import { useState, useRef, useEffect, useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaGoogle } from 'react-icons/fa';
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Toast from "./components/Toast";
import { useLanguageStore } from "./store/languageStore";
import { useThemeStore } from "./store/themeStore";
import Sidebar from "./components/Sidebar/Sidebar";
import ChatList from "./components/ChatList/ChatList";
import WelcomeScreen from "./components/WelcomeScreen/WelcomeScreen";
import MessagesList from "./components/MessagesList/MessagesList";
import InputFooter from "./components/InputFooter/InputFooter";
import Settings from "./components/Settings/Settings";
import DeleteModal from "./components/DeleteModal/DeleteModal";

const API_BASE = "https://api.merdannotfound.ru/api";

function AppContent() {
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const accentColor = useThemeStore((state) => state.accentColor);
  const setAccentColor = useThemeStore((state) => state.setAccentColor);

  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [showChatList, setShowChatList] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const creatingRef = useRef(false);

  const token = localStorage.getItem("token");

  const getHeaders = () => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    return headers;
  };

  const { data: allChatsData, isSuccess: chatsLoaded } = useQuery({
    queryKey: ["chats"],
    queryFn: () =>
      fetch(`${API_BASE}/chat`, { headers: getHeaders() }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    onError: (err) => {
      if (err.message.includes("401")) handleLogout();
      setToast({
        message: t("error-loading-chats") || "Error loading chats",
        type: "error",
      });
    },
  });

  const allChats = allChatsData || [];

  const { data: currentChat } = useQuery({
    queryKey: ["chat", currentChatId],
    queryFn: () =>
      fetch(`${API_BASE}/chat/${currentChatId}`, {
        headers: getHeaders(),
      }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
    enabled: !!currentChatId && !!token,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    onError: (err) => {
      if (err.message.includes("401")) handleLogout();
    },
  });

  const displayMessages = useMemo(() => {
    return (
      currentChat?.messages?.map((msg, index) => ({
        id: index,
        text: msg.content,
        sender: msg.role === "user" ? "user" : "ai",
        timestamp: new Date(),
      })) || []
    );
  }, [currentChat]);

  const createMutation = useMutation({
    mutationFn: (variables) => {
      const { isInitial, ...body } = variables;
      return fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        return r.json();
      });
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["chats"] });
      const previousChats = queryClient.getQueryData(["chats"]);
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticChat = { _id: optimisticId, title: "", messages: [] };
      queryClient.setQueryData(["chats"], (old) => [...(old || []), optimisticChat]);
      setCurrentChatId(optimisticId);
      return { previousChats };
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(["chats"], (old) =>
        old?.map((chat) =>
          chat._id === `optimistic-${data._id}` ? data : chat
        ) || [data]
      );
      setCurrentChatId(data._id);
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      creatingRef.current = false;
      if (!variables?.isInitial) {
        setToast({
          message: t("new-chat-started") || "New chat started",
          type: "info",
        });
      }
      if (context?.previousChats) {
        queryClient.setQueryData(["chats"], context.previousChats);
      }
    },
    onError: (err, variables, context) => {
      if (context?.previousChats) {
        queryClient.setQueryData(["chats"], context.previousChats);
      }
      if (err.message.includes("401")) handleLogout();
      setToast({
        message: `Create chat failed: ${err.message}`,
        type: "error",
      });
      creatingRef.current = false;
      setCurrentChatId(null);
    },
  });

  const updateChatMutation = useMutation({
    mutationFn: ({ chatId, body }) =>
      fetch(`${API_BASE}/chat/${chatId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(body),
      }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        return r.json();
      }),
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      if (chatId === currentChatId) {
        queryClient.invalidateQueries({ queryKey: ["chat", currentChatId] });
      }
      setEditingChatId(null);
      setToast({
        message: t("title-updated") || "Title updated",
        type: "success",
      });
    },
    onError: (err) => {
      if (err.message.includes("401")) handleLogout();
      setToast({
        message: `Update failed: ${err.message}`,
        type: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (chatId) => {
      console.log('Fetching DELETE for chat:', chatId, 'URL:', `${API_BASE}/chat/${chatId}`);
      return fetch(`${API_BASE}/chat/${chatId}`, {
        method: "DELETE",
        headers: getHeaders(),
      }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        return r;
      });
    },
    onSuccess: (_, chatId) => {
      console.log('Delete success for chat:', chatId);
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setInput("");
      }
      setToast({
        message: t("chat-deleted") || "Chat deleted",
        type: "info",
      });
      setShowDeleteModal(false);
      setChatToDelete(null);
    },
    onError: (err) => {
      console.error('Delete error:', err);
      if (err.message.includes("401")) handleLogout();
      if (err.message.includes("404")) {
        console.log('Chat already deleted (404), ignoring...');
        queryClient.invalidateQueries({ queryKey: ["chats"] });
      } else {
        setToast({
          message: t("delete-failed") || `Delete failed: ${err.message}`,
          type: "error",
        });
      }
    },
  });

  const sendMutation = useMutation({
    mutationFn: (content) =>
      fetch(`${API_BASE}/chat/${currentChatId}/message`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ role: "user", content }),
      }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ["chat", currentChatId] });
      const previousChat = queryClient.getQueryData(["chat", currentChatId]);
      if (previousChat) {
        queryClient.setQueryData(["chat", currentChatId], (old) => ({
          ...old,
          messages: [...old.messages, { role: "user", content }],
        }));
      }
      setIsTyping(true);
      return { previousChat };
    },
    onError: (err, content, context) => {
      if (context?.previousChat) {
        queryClient.setQueryData(["chat", currentChatId], context.previousChat);
      }
      if (err.message.includes("401")) handleLogout();
      setIsTyping(false);
      setToast({ message: `Send failed: ${err.message}`, type: "error" });
    },
    onSuccess: () => {
      setInput("");
      setIsTyping(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", currentChatId] });
    },
  });

  const handleLanguageChange = (newLang) => {
    i18n.changeLanguage(newLang);
    setLanguage(newLang);
  };

  const currentTitle = useMemo(() => {
    if (!currentChatId) return "Sora";
    if (currentChat?.title && currentChat.title !== "New Chat")
      return currentChat.title;
    if (displayMessages.length > 0) {
      return (
        displayMessages[0].text.substring(0, 50) +
        (displayMessages[0].text.length > 50 ? "..." : "")
      );
    }
    return t("untitled") || "Untitled";
  }, [currentChat, displayMessages, currentChatId, t]);

  useEffect(() => {
    const savedUserStr = localStorage.getItem("currentUser");
    const savedToken = localStorage.getItem("token");
    const savedCurrentChatId = localStorage.getItem("currentChatId");
    if (savedUserStr && savedUserStr !== "undefined") {
      try {
        const parsedUser = JSON.parse(savedUserStr);
        if (parsedUser && savedToken) {
          setUser(parsedUser);
          if (savedCurrentChatId) {
            setCurrentChatId(savedCurrentChatId);
          }
        } else {
          localStorage.removeItem("currentUser");
          localStorage.removeItem("token");
          localStorage.removeItem("currentChatId");
        }
      } catch (e) {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("currentChatId");
      }
    }
  }, []);

  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem("currentChatId", currentChatId);
    }
  }, [currentChatId]);

  useEffect(() => {
    console.log('Auto-create effect triggered:', {
      hasUser: !!user,
      chatsLoaded,
      chatsCount: allChats.length,
      currentId: currentChatId,
      isCreating: creatingRef.current
    });
    if (
      user &&
      chatsLoaded &&
      allChatsData.length === 0 &&
      !currentChatId &&
      !creatingRef.current
    ) {
      creatingRef.current = true;
      createMutation.mutate({ title: "", messages: [], isInitial: true });
    }
  }, [user, chatsLoaded, allChatsData?.length, currentChatId]);

  useEffect(() => {
    if (
      currentChat &&
      currentChat.title === "New Chat" &&
      displayMessages.length >= 2 &&
      displayMessages[0].sender === "user"
    ) {
      const newTitle =
        displayMessages[0].text.substring(0, 50) +
        (displayMessages[0].text.length > 50 ? "..." : "");
      updateChatMutation.mutate({
        chatId: currentChatId,
        body: { title: newTitle },
      });
    }
  }, [displayMessages.length, currentChat?.title, updateChatMutation, currentChatId]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (e) => {
      setTheme(e.matches ? "dark" : "light");
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleThemeChange);
    } else {
      mediaQuery.addListener(handleThemeChange);
    };
    handleThemeChange(mediaQuery);
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleThemeChange);
      } else {
        mediaQuery.removeListener(handleThemeChange);
      }
    };
  }, [setTheme]);

  useEffect(() => {
    document.body.className = `${theme} accent-${accentColor}`;
  }, [theme, accentColor]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    window.addEventListener("orientationchange", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("orientationchange", checkMobile);
    };
  }, []);

  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, sidebarOpen]);

  useEffect(() => {
    scrollToBottom();
    adjustTextareaHeight();
  }, [displayMessages, isTyping, input]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  };

  const handleLogin = (user) => {
    setUser(user);
  };

  const handleSignup = (user) => {
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    localStorage.removeItem("currentChatId");
    setToast({ message: t("logged-out") || "Logged out", type: "info" });
    setUser(null);
    setCurrentChatId(null);
    setInput("");
    setShowSettings(false);
    creatingRef.current = false;
    queryClient.clear();
  };

  const handleNewChat = () => {
    if (!token) {
      setToast({ message: "Please log in first", type: "error" });
      return;
    }
    console.log('Creating new chat...');
    createMutation.mutate({ title: "", messages: [] });
  };

  const handleClearChat = () => {
    if (currentChatId) {
      updateChatMutation.mutate(
        { chatId: currentChatId, body: { messages: [] } },
        {
          onSuccess: () => {
            setInput("");
            setToast({
              message: t("conversation-cleared") || "Conversation cleared",
              type: "info",
            });
          },
        }
      );
    }
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleAccentChange = (newAccent) => {
    setAccentColor(newAccent);
  };

  const handleSend = () => {
    if (!input.trim() || isTyping || !token) {
      if (!token) setToast({ message: "Please log in", type: "error" });
      return;
    }
    if (!currentChatId) {
      createMutation.mutate(
        { title: "", messages: [] },
        {
          onSuccess: (newChat) => {
            setCurrentChatId(newChat._id);
            sendMutation.mutate(input);
          },
        }
      );
    } else {
      sendMutation.mutate(input);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOpenDeleteModal = (chatId) => {
    setChatToDelete(chatId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (chatToDelete) {
      deleteMutation.mutate(chatToDelete);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setChatToDelete(null);
  };

  const suggestions = t("suggestions");
  const safeSuggestions = Array.isArray(suggestions)
    ? suggestions
    : [
        { text: "What can you help me with?", icon: "search" },
        { text: "Объясни квантовые вычисления", icon: "news" },
        { text: "Maňa kod ýazmaga kömek et", icon: "personas" },
      ];

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return allChats;
    return allChats.filter((chat) => {
      const titleMatch = chat.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const previewMatch =
        chat.messages.length > 0 &&
        chat.messages[chat.messages.length - 1].content
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return titleMatch || previewMatch;
    });
  }, [allChats, searchQuery]);

  const markdownComponents = {
    p: ({ children }) => <p className="markdown-p">{children}</p>,
    code: ({ children, className }) => (
      <code className={`markdown-code ${className || ""}`}>{children}</code>
    ),
    pre: ({ children }) => <pre className="markdown-pre">{children}</pre>,
    blockquote: ({ children }) => (
      <blockquote className="markdown-blockquote">{children}</blockquote>
    ),
    ul: ({ children }) => <ul className="markdown-ul">{children}</ul>,
    ol: ({ children }) => <ol className="markdown-ol">{children}</ol>,
    li: ({ children }) => <li className="markdown-li">{children}</li>,
    strong: ({ children }) => (
      <strong className="markdown-strong">{children}</strong>
    ),
    em: ({ children }) => <em className="markdown-em">{children}</em>,
    a: ({ children, href }) => (
      <a
        href={href}
        className="markdown-a"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  };

  if (!user) {
    if (authMode === "login") {
      return (
        <Login
          onLogin={handleLogin}
          onSwitchToSignup={() => setAuthMode("signup")}
          toast={toast}
          setToast={setToast}
        />
      );
    } else {
      return (
        <Signup
          onSignup={handleSignup}
          onSwitchToLogin={() => setAuthMode("login")}
          toast={toast}
          setToast={setToast}
        />
      );
    }
  }

  if (showSettings) {
    return (
      <Settings
        theme={theme}
        accentColor={accentColor}
        onThemeToggle={handleThemeToggle}
        onAccentChange={handleAccentChange}
        onLanguageChange={handleLanguageChange}
        language={language}
        onBack={() => setShowSettings(false)}
        onLogout={handleLogout}
        t={t}
      />
    );
  }

  const headerTitle = !currentChatId ? "Sora" : currentTitle;

  return (
    <div className={`app ${theme} accent-${accentColor}`}>
      <Sidebar
        showChatList={showChatList}
        onToggleChatList={() => setShowChatList(!showChatList)}
        onNewChat={handleNewChat}
        onSettings={handleSettings}
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        user={user}
        currentChatId={currentChatId}
        t={t}
      >
        {showChatList && (
          <ChatList
            allChats={allChats}
            filteredChats={filteredChats}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            currentChatId={currentChatId}
            onSelectChat={(chatId) => {
              setCurrentChatId(chatId);
              if (isMobile) setShowChatList(false);
            }}
            editingChatId={editingChatId}
            editingTitle={editingTitle}
            onEditTitleChange={setEditingTitle}
            onBlurEdit={(chatId, title) => {
              const trimmedTitle = title.trim();
              if (trimmedTitle || trimmedTitle === "") {
                updateChatMutation.mutate({
                  chatId,
                  body: { title: trimmedTitle },
                });
              } else {
                setEditingTitle(
                  allChats.find((c) => c._id === chatId)?.title || ""
                );
              }
              setEditingChatId(null);
            }}
            onStartEdit={(chatId, title) => {
              setEditingChatId(chatId);
              setEditingTitle(title);
            }}
            onDeleteChat={handleOpenDeleteModal}
            t={t}
          />
        )}
      </Sidebar>

      {isMobile && sidebarOpen && (
        <div className="backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="main-wrapper">
        <main className="main-content">
          {isMobile && (
            <header className="mobile-header">
              <button
                className="menu-toggle"
                onClick={() => setSidebarOpen((prev) => !prev)}
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 6H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M3 12H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M3 18H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <div className="current-chat-info">
                <h2>{headerTitle}</h2>
                {currentChatId && (
                  <button className="new-chat-mobile" onClick={handleNewChat}>
                    {t("new-chat") || "New Chat"}
                  </button>
                )}
              </div>
            </header>
          )}
          <div className="chat-container">
            {displayMessages.length === 0 ? (
              <WelcomeScreen
                suggestions={safeSuggestions}
                onSuggestionClick={setInput}
                t={t}
              />
            ) : (
              <MessagesList
                messages={displayMessages}
                isTyping={isTyping}
                messagesEndRef={messagesEndRef}
                userInitial={user?.name?.charAt(0).toUpperCase() || "U"}
                markdownComponents={markdownComponents}
              />
            )}
          </div>
        </main>
        <InputFooter
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          isTyping={isTyping}
          textareaRef={textareaRef}
          onKeyPress={handleKeyPress}
          t={t}
          onGoogleSearch={() => {
            console.log('Google search triggered!');
          }}
        />
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          t={t}
        />
      )}
    </div>
  );
}

export default AppContent;