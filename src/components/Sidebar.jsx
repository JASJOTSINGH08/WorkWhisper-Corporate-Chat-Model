import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useSocket } from '../providers/SocketProvider';
import { useTheme } from '../providers/ThemeProvider';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();
  const { userList, loadChatHistory, setActiveChatUser, activeChatUser, socket } = useSocket();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});
  const [lastMessages, setLastMessages] = useState({});

  useEffect(() => {
    fetch('http://localhost:8081/users')
      .then((res) => res.json())
      .then((data) => {
        const emailToUsernameMap = {};
        data.forEach((u) => (emailToUsernameMap[u.email] = u.username));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (socket) {
      const handleMessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case 'userOnline':
              setOnlineUsers((prev) => new Set(prev).add(data.username));
              break;
            case 'userOffline':
              setOnlineUsers((prev) => {
                const updated = new Set(prev);
                updated.delete(data.username);
                return updated;
              });
              break;
            case 'unreadCount':
              setUnreadCounts((prev) => ({ ...prev, [data.username]: data.count }));
              break;
            case 'message':
              if (data.sender !== user.username) {
                setLastMessages((prev) => ({
                  ...prev,
                  [data.sender]: {
                    content: data.content,
                    timestamp: data.timestamp
                  }
                }));
              }
              break;
            default:
              console.log('Unhandled WebSocket message:', data);
          }
        } catch (err) {
          console.error('WebSocket error:', err);
        }
      };

      socket.addEventListener('message', handleMessage);
      return () => socket.removeEventListener('message', handleMessage);
    }
  }, [socket, user.username]);

  const filteredAndSortedUsers = useMemo(() => {
    const filtered = userList
      .filter((uname) => uname !== user.username && uname.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((uname) => ({
        username: uname,
        lastActivity: lastMessages[uname]?.timestamp || 0,
        isOnline: onlineUsers.has(uname)
      }))
      .sort((a, b) => {
        // Sort by online status first, then by last activity
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        return new Date(b.lastActivity) - new Date(a.lastActivity);
      });

    return filtered;
  }, [userList, user.username, searchTerm, onlineUsers, lastMessages]);

  const handleUserClick = (username) => {
    if (username !== user.username) {
      loadChatHistory(username);
      setActiveChatUser(username);
      setUnreadCounts((prev) => ({ ...prev, [username]: 0 }));
    }
  };

  const getInitials = (username) => {
    return username.substring(0, 2).toUpperCase();
  };

  const formatLastMessage = (content) => {
    if (!content) return 'No messages yet';
    return content.length > 35 ? content.substring(0, 35) + '...' : content;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="modern-sidebar">
      <div className="sidebar-header">
        <div className="header-content">
          <h1 className="app-title">Messages</h1>
          <div className="header-actions">
            <button className="action-btn" aria-label="New chat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
                <polygon points="18,2 22,6 12,16 8,16 8,12 18,2"></polygon>
              </svg>
            </button>
          </div>
        </div>
        <div className="search-container">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search conversations..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="conversations-list">
        {filteredAndSortedUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p className="empty-text">No conversations found</p>
            <p className="empty-subtext">Start a new conversation to get started</p>
          </div>
        ) : (
          filteredAndSortedUsers.map(({ username, isOnline }) => (
            <div
              key={username}
              onClick={() => handleUserClick(username)}
              className={`conversation-item ${activeChatUser === username ? 'active' : ''}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleUserClick(username)}
            >
              <div className="avatar-container">
                <div className={`user-avatar ${isOnline ? 'online' : ''}`}>
                  <span className="avatar-text">{getInitials(username)}</span>
                </div>
                {isOnline && <div className="online-indicator"></div>}
              </div>
              
              <div className="conversation-content">
                <div className="conversation-header">
                  <h3 className="username">{username}</h3>
                  <span className="timestamp">{formatTime(lastMessages[username]?.timestamp)}</span>
                </div>
                <div className="conversation-preview">
                  <p className="last-message">{formatLastMessage(lastMessages[username]?.content)}</p>
                  {unreadCounts[username] > 0 && (
                    <div className="unread-badge">
                      <span>{unreadCounts[username] > 99 ? '99+' : unreadCounts[username]}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <div className="current-user">
          <div className="user-avatar online">
            <span className="avatar-text">{getInitials(user.username)}</span>
          </div>
          <div className="user-info">
            <span className="current-username">{user.username}</span>
            <span className="user-status">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;