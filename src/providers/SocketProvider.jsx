import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthProvider';
import dayjs from 'dayjs';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userList, setUserList] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const socketInstance = useRef(null);
  const pingIntervalRef = useRef(null);
  const pingStartTime = useRef(null);

  const encrypt = (text, key = 'secretKey') => text.split('').map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join('');
  const decrypt = (text, key = 'secretKey') => text.split('').map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join('');

  // ✅ 1. Add helper function to map email → username
  const getUsernameFromEmail = (email) => {
    const userObj = userList.find(u => u.email === email || u.username === email);
    return userObj ? userObj.username : email;
  };

  const sendWithRetry = useCallback(
  (receiver, content, metadata = {}, maxRetries = 3, delay = 1000) => {
    const encryptedContent = encrypt(content);
    let attempts = 0;
    const tempId = Date.now() + Math.random();

    const msgPayload = {
      type: metadata.type || 'message',
      sender: user.username,
      receiver,
      content: encryptedContent,
      timestamp: dayjs().format('YYYY-MM-DD  HH:mm'),
      fileName: metadata.fileName || undefined,
      mimeType: metadata.mimeType || undefined,
    };

   if (msgPayload.type === 'message') {
  setMessages((prev) => [
    ...prev,
    {
      ...msgPayload,
      content, // already decrypted before encrypting
      status: 'sending',
    },
  ]);
}
 else if (msgPayload.type === 'file') {
  setMessages((prev) => [
    ...prev,
    {
      id: tempId,
      type: 'file',
      sender: user.username,
      receiver,
      content, // file path, not encrypted
      fileName: msgPayload.fileName || content.split('/').pop(),
      mimeType: msgPayload.mimeType || null,
      status: 'sent',
      timestamp: msgPayload.timestamp,
      isFile: true,
    },
  ]);
}
console.log("📨 Message added to state (file):", msgPayload);


    const attemptSend = () => {
      if (attempts >= maxRetries) {
        setError(`Failed to send after ${maxRetries} attempts`);
        return;
      }

      if (!socket || socket.readyState !== WebSocket.OPEN) {
        setTimeout(attemptSend, delay * Math.pow(2, attempts));
        attempts++;
        return;
      }

      console.log('📤 Sending message:', msgPayload);
      socket.send(JSON.stringify(msgPayload));
    };

    attemptSend();
  },
  [socket, user]
);

  const reconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    if (!socket || socket.readyState === WebSocket.CLOSED) {
      const newSocket = new WebSocket('ws://localhost:8080');
      socketInstance.current = newSocket;
      setSocket(newSocket);

      newSocket.onopen = () => {
        console.log('✅ WebSocket connected');
        setError(null);
        setIsConnected(true);
        setLoading(false);
        reconnectAttempts.current = 0;
        pingStartTime.current = Date.now();
        pingIntervalRef.current = setInterval(() => {
          const elapsedTime = Date.now() - pingStartTime.current;
          const threeHoursMs = 3 * 60 * 60 * 1000;
          if (newSocket.readyState === WebSocket.OPEN && elapsedTime < threeHoursMs && document.visibilityState === 'visible') {
            newSocket.send(JSON.stringify({ type: 'ping' }));
          } else if (elapsedTime >= threeHoursMs) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
          }
        }, 60000);
        newSocket.send(JSON.stringify({ type: 'ping' }));
      };

      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📩 Message received:', data);
          switch (data.type) {
            case 'clientList':
            case 'userlist':
              setUserList(data.clients || data.users || []);
              setLoading(false);
              break;
            case 'message':
              const decryptedContent = decrypt(data.content);
              if (data.receiver === user.username || data.sender === user.username) { // Filter for current user
                setMessages((prev) => [...prev, { ...data, content: decryptedContent, status: 'delivered' }]);
              }
              break;
           case 'chatHistory': {
  const newHistory = data.history.map(msg => ({
    ...msg,
    content: decrypt(msg.content || msg.content),
    status: 'delivered',
  }));

  console.log("✅ Appending chat history to messages:", newHistory);

  setMessages(prev => {
    const combined = [...prev, ...newHistory];

    // 🧼 Optional: remove duplicates by ID + timestamp if you store them
    const unique = Array.from(new Map(combined.map(m => [m.timestamp + m.sender, m])).values());

    return unique;
  });

  break;
}

case 'file': {
  // Do NOT decrypt `content` (it's a file path)
  console.log("📦 File message received:", data);
  if (data.receiver === user.username || data.sender === user.username) {
    setMessages((prev) => [
      ...prev,
      {
        ...data,
        status: 'delivered',
        isFile: true,
        mimeType: data.mimeType || null,
        fileName: data.fileName || null,
      },
    ]);
  }
  break;
}


            case 'pong':
              console.log('🏓 Pong received');
              break;
            default:
              console.log('Unknown WebSocket type:', data.type);
          }
        } catch (err) {
          console.error('WebSocket message error:', err);
        }
      };

      newSocket.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('WebSocket connection error. Attempting to reconnect...');
      };

      newSocket.onclose = (event) => {
        console.log('WebSocket closed:', event.reason);
        setIsConnected(false);
        setLoading(false);
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        if (socketInstance.current === newSocket) {
          setSocket(null);
          if (event.code !== 1000) {
            reconnectAttempts.current += 1;
            reconnectTimeoutRef.current = setTimeout(reconnect, 1000 * Math.pow(2, Math.min(5, reconnectAttempts.current)));
          }
        }
      };
    }
  }, [user]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        console.log("🔁 Tab is visible again, trying reconnect");
        reconnect();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [reconnect]);

  useEffect(() => {
    reconnect();
    return () => {
      if (socketInstance.current) socketInstance.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, [reconnect]);

  useEffect(() => {
    const tryInit = (attempts = 0) => {
      if (!user || !socket || socket.readyState !== WebSocket.OPEN) {
        if (attempts < 10) {
          setTimeout(() => tryInit(attempts + 1), 300);
        }
        return;
      }
      console.log("✅ Sending init after user is ready:", user.username);
      socket.send(JSON.stringify({ type: 'init', username: user.username }));
      requestUserList();
    };

    tryInit();
  }, [socket, user]);

  // ✅ Restore active chat user & load history on page reload
  useEffect(() => {
    const savedChatUser = localStorage.getItem('activeChatUser');
    if (
      savedChatUser &&
      user?.username &&
      socket &&
      socket.readyState === WebSocket.OPEN
    ) {
      setActiveChatUser(savedChatUser);
      loadChatHistory(savedChatUser);
    }
  }, [user, socket]);

  const requestUserList = (sock = socket) => {
    if (sock && user && sock.readyState === WebSocket.OPEN) {
      setLoading(true);
      setError(null);
      sock.send(JSON.stringify({ type: 'getUsers' }));
    }
  };

  // ✅ 3. Fix loadChatHistory
  const loadChatHistory = (receiverEmail) => {
    const username = getUsernameFromEmail(receiverEmail);
    if (socket && socket.readyState === WebSocket.OPEN && user) {
      socket.send(JSON.stringify({ type: 'history', receiver: username }));
      localStorage.setItem('activeChatUser', receiverEmail); // preserve email for UI
    }
  };

  // ✅ 2. Fix sendMessage
  const sendMessage = (receiverEmail, content) => {
    const username = getUsernameFromEmail(receiverEmail);
    if (socket && user) {
      sendWithRetry(username, content);
    }
  };

  const sendFile = (receiverEmail, filePath, fileName, mimeType) => {
  const username = getUsernameFromEmail(receiverEmail);
  if (socket && user) {
    sendWithRetry(username, filePath, {
      fileName,
      mimeType,
      type: 'file',
    });
  }
};


  return (
    <SocketContext.Provider
      value={{
        socket,
        messages,
        userList,
        activeChatUser,
        setActiveChatUser,
        requestUserList,
        loadChatHistory,
        sendMessage,
        sendFile,
        loading,
        error,
        isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;