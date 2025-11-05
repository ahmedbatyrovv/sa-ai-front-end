# SA-AI Chat

[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://reactjs.org/) [![TanStack Query](https://img.shields.io/badge/TanStack%20Query-v5-green?logo=react)](https://tanstack.com/query/latest/) [![Zustand](https://img.shields.io/badge/Zustand-State%20Management-orange?logo=javascript)](https://zustand-demo.pmnd.rs/) [![i18next](https://img.shields.io/badge/i18next-Internationalization-purple?logo=react)](https://react.i18next.com/)

SA-AI is a modern, responsive chat application inspired by AI conversation interfaces like Grok or ChatGPT. It features user authentication, multi-language support, customizable themes, chat history management, and real-time messaging with Markdown rendering. Built with React, it connects to a custom backend API for seamless user sessions and data persistence.

Perfect for developers looking to build or prototype AI-powered chat UIs. Currently hooked up to a demo API at `https://api.merdannotfound.ru/api`—feel free to swap it out for your own backend!

## 🚀 Features

### Core Functionality
- **Authentication System**: Secure login and signup with email/password. Social logins (Google, GitHub, Phone) are stubbed with "Coming Soon!" placeholders for easy extension.
- **Real-Time Chat Interface**: Send messages, receive AI responses with optimistic updates, auto-scroll to bottom, and typing indicators for a smooth UX.
- **Chat History Management**:
  - Create new chats.
  - Edit chat titles (double-click to inline edit).
  - Search chats by title or last message preview.
  - Delete chats with confirmation modal to prevent accidents.
- **Message Handling**: User messages trigger backend AI responses; supports clearing entire conversations.

### Customization & Personalization
- **Themes**: Light/Dark mode with automatic detection based on system preferences (`prefers-color-scheme`).
- **Accent Colors**: Three customizable schemes—Mostly (Blue), Vitally (Purple), Principally (Orange)—applied via CSS variables for dynamic styling.
- **Multi-Language Support**: Full internationalization (i18n) with English (EN), Russian (RU), and Turkmen (TM). Translations cover UI elements, errors, and suggestions; persists via localStorage.

### UI/UX Enhancements
- **Responsive Design**: Mobile-first layout with collapsible sidebar (toggle on small screens), backdrop overlay, and orientation change handling.
- **Markdown Rendering**: AI responses support formatted text (bold, italics, lists, code blocks, links, blockquotes) via `react-markdown` and `remark-gfm`.
- **Welcome Screen**: Empty chat state with interactive suggestion chips (e.g., "What can you help me with?", "Explain quantum computing", "Help me write code") to kickstart conversations.
- **Toast Notifications**: Non-intrusive alerts for successes, errors, and info (e.g., "Chat deleted", "New chat started").
- **Auto-Title Generation**: New chats get auto-titled based on the first user message (truncated to 50 chars).
- **Keyboard Shortcuts**: Enter to send (Shift+Enter for new lines), Escape to cancel edits.

### Performance & Accessibility
- **State Management**: Lightweight with Zustand (devtools-enabled, persisted to localStorage for theme/language).
- **Data Fetching & Caching**: TanStack Query for queries/mutations with stale time (5min), garbage collection (10min), and invalidation on focus/mutate.
- **Accessibility**: Semantic HTML, ARIA labels on icons/buttons, high-contrast themes, keyboard-navigable inputs and modals.
- **Error Handling**: Graceful fallbacks for API errors (e.g., 401 auto-logout), network issues, and invalid states.

### Additional Polish
- **User Profile**: Avatar with initials, profile info in sidebar.
- **Settings Panel**: Dedicated screen for theme/accent/language toggles and logout.
- **Mobile Optimizations**: Overflow handling, touch-friendly buttons, header with menu toggle and new chat button.
- **Security**: Token-based auth in headers; localStorage for user/token persistence with validation on load.

## 🛠 Tech Stack

- **Frontend Framework**: React 18 (hooks-heavy, functional components).
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) with `devtools` and `persist` middleware.
- **Data Layer**: [@tanstack/react-query](https://tanstack.com/query/latest/) for API interactions (queries for chats/current chat, mutations for CRUD).
- **Styling**: Vanilla CSS with class-based theming (e.g., `.app.light.accent-mostly`); no external CSS-in-JS.
- **Internationalization**: [react-i18next](https://react.i18next.com/) with custom translation files.
- **UI Libraries**:
  - [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) for Markdown.
  - Custom SVG icons (Heroicons-inspired).
- **Auth & HTTP**: [Axios](https://axios-http.com/) for login/signup; native `fetch` for chat ops.
- **Other Utils**: `useMemo` for computed values (e.g., filtered chats, titles); `useRef` for DOM refs (scroll, textarea auto-resize).
- **Backend Dependency**: RESTful API (see [API Integration](#api-integration) below); no server-side code included.