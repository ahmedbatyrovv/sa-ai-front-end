// src/components/ChatList/ChatList.jsx
import { useMemo } from "react";
import styles from "./ChatList.module.css";

const ChatList = ({
  allChats,
  filteredChats,
  searchQuery,
  onSearchChange,
  currentChatId,
  onSelectChat,
  editingChatId,
  editingTitle,
  onEditTitleChange,
  onBlurEdit,
  onStartEdit,
  onDeleteChat,
  t,
}) => {
  // If filteredChats not passed, compute here (fallback)
  const computedFilteredChats = useMemo(() => {
    if (filteredChats) return filteredChats;
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
  }, [allChats, searchQuery, filteredChats]);

  const handleEditBlur = (chatId, e) => {
    onBlurEdit(chatId, e.target.value);
  };

  const handleEditKeyDown = (chatId, e) => {
    if (e.key === "Enter") {
      e.target.blur();
    } else if (e.key === "Escape") {
      // Reset to original title
      const originalTitle = allChats.find((c) => c._id === chatId)?.title || "";
      onEditTitleChange(originalTitle);
      onBlurEdit(chatId, originalTitle);
    }
  };

  return (
    <div className={styles["chat-list"]}>
      <div className={styles["chat-search"]}>
        <svg viewBox="0 0 24 24" fill="none" className={styles["search-icon"]}>
          <circle
            cx="11"
            cy="11"
            r="8"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M21 21L16.65 16.65"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          placeholder={t("search-chats") || "Search chats"}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles["search-input"]}
        />
      </div>
      {computedFilteredChats.length === 0 ? (
        <div className={styles["no-chats"]}>
          {searchQuery
            ? t("no-chats-found") || "No chats found"
            : t("no-chats") || "No chats"}
        </div>
      ) : (
        computedFilteredChats
          .slice()
          .reverse()
          .map((chat) => {
            const isEditing = editingChatId === chat._id;
            const chatTitle = chat.title || (t("untitled") || "Untitled");
            const previewText =
              chat.messages.length > 0
                ? chat.messages[chat.messages.length - 1].content.substring(
                    0,
                    50
                  ) +
                  (chat.messages[chat.messages.length - 1].content.length > 50
                    ? "..."
                    : "")
                : "";
            return (
              <div
                key={chat._id}
                className={`${styles["chat-item-wrapper"]} ${
                  chat._id === currentChatId ? styles.active : ""
                }`}
              >
                <button
                  className={styles["chat-item"]}
                  onClick={() => onSelectChat(chat._id)}
                >
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => onEditTitleChange(e.target.value)}
                      onBlur={(e) => handleEditBlur(chat._id, e)}
                      onKeyDown={(e) => handleEditKeyDown(chat._id, e)}
                      autoFocus
                      className={styles["chat-title-input"]}
                    />
                  ) : (
                    <div
                      className={styles["chat-title"]}
                      onDoubleClick={() => onStartEdit(chat._id, chatTitle)}
                    >
                      {chatTitle}
                    </div>
                  )}
                  {previewText && (
                    <div className={styles["chat-preview"]}>{previewText}</div>
                  )}
                </button>
                <div className={styles["chat-actions"]}>
                  <button
                    className={`${styles["chat-action-btn"]} ${styles["edit-btn"]}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartEdit(chat._id, chatTitle);
                    }}
                    title={t("edit-title") || "Edit title"}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className={styles["edit-icon"]}
                    >
                      <path
                        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    className={`${styles["chat-action-btn"]} ${styles["delete-btn"]}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Delete button clicked for chat:', chat._id);
                      onDeleteChat(chat._id);
                    }}
                    title={t("delete-chat") || "Delete chat"}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className={styles["delete-icon"]}
                    >
                      <path
                        d="M3 6h18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M8 6V4c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6h18z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
      )}
    </div>
  );
};

export default ChatList;