import React, { useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useSocket } from '../providers/SocketProvider';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import './ChatApp.css';

const ChatApp = () => {
  const { user } = useAuth();
  console.log("User object in ChatApp:", user);
  const { requestUserList } = useSocket();

  useEffect(() => {
    if (user?.username && typeof requestUserList === 'function') {
      requestUserList();
    }
  }, [user, requestUserList]);

  if(!user) return <div>Loading chat...</div>
    return (
    <div className="h-full w-full flex container">
      <Sidebar />
      <ChatWindow />
    </div>
  );
};

export default ChatApp;