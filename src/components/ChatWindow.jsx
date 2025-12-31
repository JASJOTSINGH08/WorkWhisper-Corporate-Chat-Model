import React, { useState, useMemo } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useSocket } from '../providers/SocketProvider';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatWindow.css';

const ChatWindow = () => {
  const { user } = useAuth();
  const { messages, sendMessage, activeChatUser, setActiveChatUser, userList } = useSocket();
  const [message, setMessage] = useState('');

  console.log("✅ Logged-in user:", user.username);
  console.log("✅ Active chat user (email or username):", activeChatUser);

  const chatPartnerUsername = useMemo(() => {
    if (!activeChatUser) return null;
    const found = userList.find(u => u.email === activeChatUser || u.username === activeChatUser);
    const resolvedUsername = found ? found.username : activeChatUser;
  console.log("🧑‍🤝‍🧑 Chat partner username (resolved):", resolvedUsername);
  return resolvedUsername;
  }, [activeChatUser, userList]);

  console.log("📨 All messages in context:", messages);
  
  const filteredMessages = useMemo(() => {
    if (!chatPartnerUsername) return [];
    return messages.filter(
      (msg) =>
        (msg.sender === user.username && msg.receiver === chatPartnerUsername) ||
        (msg.sender === chatPartnerUsername && msg.receiver === user.username)
    );
  }, [messages, user.username, chatPartnerUsername]);

  console.log("📬 Filtered messages for display:", filteredMessages);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim() && activeChatUser) {
      sendMessage(chatPartnerUsername, message); // ✅ Use username here
      setMessage('');
    }
  };

  if (!activeChatUser) {
    return (
      <div className="chat-window flex-1 flex flex-col h-full bg-gray-100 dark:bg-gray-900" role="main">
        <ChatHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="chat-placeholder">Select a user to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window flex flex-col h-full bg-gray-100 dark:bg-gray-900" role="main">
      <ChatHeader />
      <MessageList messages={filteredMessages} />
      <MessageInput
        message={message}
        setMessage={setMessage}
        handleSend={handleSend}
        chatPartnerUsername={chatPartnerUsername} // ✅ pass username
      />
    </div>
  );
};

export default ChatWindow;
