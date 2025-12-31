import React, { useEffect, useState } from 'react';
import { useSocket } from '../providers/SocketProvider';
import { useTheme } from '../providers/ThemeProvider';
import './ChatHeader.css';

const ChatHeader = () => {
  const { activeChatUser, userList } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const [emailToUsername, setEmailToUsername] = useState({});
  const [isOnline, setIsOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8081/users')
      .then((res) => res.json())
      .then(setEmailToUsername)
      .catch(console.error);
  }, []);

  const displayName = activeChatUser ? (emailToUsername[activeChatUser] || activeChatUser) : null;

  const getInitials = (name) => {
    if (!name) return '';
    return name.substring(0, 2).toUpperCase();
  };

  const getOnlineStatus = () => {
    // This would typically come from your socket connection
    return isOnline ? 'Online' : 'Last seen recently';
  };

  if (!activeChatUser) {
    return (
      <div className="modern-chat-header empty">
        <div className="empty-chat-content">
          <div className="welcome-message">
            <h2>Welcome to WorkWhisper</h2>
            <p>Select a conversation to start messaging</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div className="theme-icon">
              {theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-chat-header">
      <div className="chat-user-info">
        <button className="back-button" aria-label="Back to conversations">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6"/>
          </svg>
        </button>
        
        <div className="user-avatar-container">
          <div className={`user-avatar ${isOnline ? 'online' : ''}`}>
            <span className="avatar-text">{getInitials(displayName)}</span>
          </div>
          {isOnline && <div className="online-indicator"></div>}
        </div>
        
        <div className="user-details">
          <h3 className="user-name">{displayName}</h3>
          <p className="user-status">
            {isTyping ? (
              <span className="typing-indicator">
                <span className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
                typing...
              </span>
            ) : (
              getOnlineStatus()
            )}
          </p>
        </div>
      </div>

      <div className="header-actions">
        <button className="action-button" aria-label="Voice call">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </button>
        
        <button className="action-button" aria-label="Video call">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="23,7 16,12 23,17 23,7"/>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
        </button>
        
        <button className="action-button" aria-label="More options">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1"/>
            <circle cx="19" cy="12" r="1"/>
            <circle cx="5" cy="12" r="1"/>
          </svg>
        </button>
        
        <button
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <div className="theme-icon">
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
