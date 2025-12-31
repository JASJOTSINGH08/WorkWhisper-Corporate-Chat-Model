import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { useTheme } from '../providers/ThemeProvider';
import { useAuth } from '../providers/AuthProvider';
import './MessageList.css';

const MessageList = ({ messages }) => {
  const { theme } = useTheme();
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages) {
    return (
      <div className="message-list flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-900">
        <p className="text-white">Loading chat...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="message-list">
        <p className="no-messages">No messages yet.</p>
      </div>
    );
  }

  return (
    <div className="message-list flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-900" role="log">
      {messages.map((msg, index) => (
        <MessageBubble
          key={index}
          text={msg.content}
          sender={msg.sender === user.username ? 'sent' : 'received'} // Correctly sets 'sent' or 'received'
          timestamp={msg.timestamp}
          fileName={msg.fileName} // ✅ Added filename prop
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;