import React from "react";
import styles from "./Sidebar.module.css";

const Sidebar = ({
  showChatList,
  onToggleChatList,
  onNewChat,
  onSettings,
  isMobile,
  sidebarOpen,
  onToggleSidebar,
  user,
  currentChatId,
  t,
  children,
}) => {
  const userInitial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <aside
      className={`${styles.sidebar} ${
        showChatList ? styles["sidebar-wide"] : ""
      } ${sidebarOpen ? styles.open : ""}`}
    >
      <div className={styles["sidebar-nav"]}>
        {/* Home/Sora button */}
        <button
          className={`${styles["sidebar-icon"]} ${
            !currentChatId ? styles.active : ""
          }`}
          onClick={onNewChat}
          data-tooltip="Sora"
        >
          <svg viewBox="0 0 24 24" fill="none" className={styles["ai-home-icon"]}>
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.3" />
            <circle cx="8" cy="8" r="0.5" fill="currentColor" opacity="0.3" />
            <circle
              cx="16"
              cy="8"
              r="0.5"
              fill="currentColor"
              opacity="0.3"
            />
            <circle
              cx="8"
              cy="16"
              r="0.5"
              fill="currentColor"
              opacity="0.3"
            />
            <circle
              cx="16"
              cy="16"
              r="0.5"
              fill="currentColor"
              opacity="0.3"
            />
          </svg>
          {showChatList && <span className={styles["icon-label"]}>Sora</span>}
        </button>

        {/* New Chat button */}
        <button
          className={styles["sidebar-icon"]}
          onClick={onNewChat}
          data-tooltip={t("new-chat") || "New Chat"}
        >
          <svg viewBox="0 0 24 24" fill="none" className={styles["ai-chat-icon"]}>
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="3" r="1" fill="currentColor" opacity="0.6" />
            <path
              d="M12 3L10 1M12 3L14 1"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>
          {showChatList && (
            <span className={styles["icon-label"]}>
              {t("new-chat") || "New Chat"}
            </span>
          )}
        </button>

        {/* Chat History button */}
        <button
          className={`${styles["sidebar-icon"]} ${
            showChatList ? styles.active : ""
          }`}
          onClick={() => onToggleChatList()}
          data-tooltip={t("chat-history") || "Chat History"}
        >
          <svg viewBox="0 0 24 24" fill="none" className={styles["ai-history-icon"]}>
            <path
              d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="5" cy="6" r="1" fill="currentColor" opacity="0.4" />
            <circle cx="19" cy="6" r="1" fill="currentColor" opacity="0.4" />
          </svg>
          {showChatList && (
            <span className={styles["icon-label"]}>
              {t("chat-history") || "Chat History"}
            </span>
          )}
        </button>

        {/* Settings button */}
        <button
          className={styles["sidebar-icon"]}
          onClick={onSettings}
          data-tooltip={t("settings") || "Settings"}
        >
          <svg viewBox="0 0 24 24" fill="none" className={styles["ai-settings-icon"]}>
            <path
              d="m20.91 10.29-3.37-1.86a1.68 1.68 0 0 0-2.04.39l-1.17 2.02a1.68 1.68 0 0 1-2.04.39l-1.17-2.02a1.68 1.68 0 0 0-2.04-.39L6.46 10.29a1.68 1.68 0 0 0-.39 2.04l1.17 2.02a1.68 1.68 0 0 1 .39 2.04l-1.17 2.02a1.68 1.68 0 0 0 .39 2.04l3.37 1.86a1.68 1.68 0 0 0 2.04-.39l1.17-2.02a1.68 1.68 0 0 1 2.04-.39l1.17 2.02a1.68 1.68 0 0 0 2.04.39l3.37-1.86a1.68 1.68 0 0 0-.39-2.04l-1.17-2.02a1.68 1.68 0 0 1-.39-2.04l1.17-2.02a1.68 1.68 0 0 0 .39-2.04zM12 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="13"
              r="0.5"
              fill="currentColor"
              opacity="0.5"
            />
          </svg>
          {showChatList && (
            <span className={styles["icon-label"]}>
              {t("settings") || "Settings"}
            </span>
          )}
        </button>
      </div>

      <div className={styles["sidebar-content"]}>{children}</div>

      <div className={styles["sidebar-spacer"]}></div>

      <div className={styles["sidebar-footer"]}>
        {/* Profile button */}
        <button
          className={`${styles["sidebar-icon"]} ${styles["sidebar-profile"]} ${
            showChatList ? styles["profile-wide-item"] : ""
          }`}
          data-tooltip={user?.name || t("profile") || "Profile"}
        >
          {!showChatList ? (
            <div className={styles["profile-initial"]}>
              <div className={styles["user-avatar"]}>{userInitial}</div>
            </div>
          ) : (
            <div className={styles["profile-wide"]}>
              <div className={styles["profile-avatar"]}>
                <div className={styles["user-avatar"]}>{userInitial}</div>
              </div>
              <div className={styles["profile-info"]}>
                <span className={styles["profile-name"]}>
                  {user?.name || t("profile") || "Profile"}
                </span>
                <span className={styles["profile-subtitle"]}>
                  {t("ai-powered") || "AI-powered"}
                </span>
              </div>
            </div>
          )}
        </button>

        {/* Toggle Sidebar button (for wide mode) */}
        <button
          className={`${styles["sidebar-icon"]} ${styles["sidebar-toggle"]}`}
          onClick={onToggleChatList}
          data-tooltip={t("toggle-sidebar") || "Toggle Sidebar"}
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
          {showChatList && (
            <span className={styles["icon-label"]}>
              {t("toggle-sidebar") || "Toggle Sidebar"}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;