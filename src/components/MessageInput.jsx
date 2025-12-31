import React, { useState, useRef } from 'react';
import { useSocket } from '../providers/SocketProvider';
import { useAuth } from '../providers/AuthProvider'; // Added to access user
import './MessageInput.css';

const MessageInput = ({ message, setMessage, handleSend, chatPartnerUsername }) => {
  const [text, setText] = useState('');
  const { sendMessage, sendFile } = useSocket(); // ✅ Include sendFile here
  const fileInputRef = useRef();
  const { user } = useAuth(); // Added to get username

  const handleSendInternal = () => {
    if (text.trim() && text.length <= 500 && chatPartnerUsername) {
      sendMessage(chatPartnerUsername, text); // ✅ send to username
      setText('');
    }
  };

  const generateSmartFilename = (originalName) => {
    const extension = originalName.split('.').pop(); // Get file extension
    const timestamp = Math.floor(new Date().getTime() / 1000); // 10-digit Unix time
    const randomPart = Math.random().toString(36).substring(2, 7); // 5 random chars
    return `ww-${timestamp}-${randomPart}.${extension}`;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !chatPartnerUsername) return;

    const reader = new FileReader(); // <== Add this before reader.onload
    reader.onload = async () => {
  const arrayBuffer = reader.result;
  const blob = new Blob([arrayBuffer], { type: file.type });
  const formData = new FormData();

  const newName = generateSmartFilename(file.name);
  const path = `${user.username}/${user.username}_${chatPartnerUsername}/${newName}`;

  formData.append('file', file, newName);
  formData.append('path', path); // Server will store in correct subfolder

  try {
    const res = await fetch('http://localhost:8082/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      sendFile(chatPartnerUsername, path, newName, file.type); // 🆕 now path = content
    } else {
      console.error('❌ Upload failed');
    }
  } catch (err) {
    console.error('❌ Error uploading file:', err);
  }
};

reader.readAsArrayBuffer(file);
};



  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSendInternal();
  };

  return (
    <div className="message-input">
      <input
        type="text"
        placeholder="Type a message"
        className="input-field"
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 500))}
        onKeyDown={handleKeyDown}
        aria-label="Type a message"
        disabled={!chatPartnerUsername}
      />

      <button
        className="send-button enhanced-btn icon-btn"
        onClick={handleSendInternal}
        disabled={!text.trim() || !chatPartnerUsername}
        aria-label="Send message"
        title="Send"
      >
        <img src="/1send.svg" alt="Send" className="icon" />
      </button>

      <input
        type="file"
        onChange={handleFileUpload}
        accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current.click()}
        className="attach-button enhanced-btn icon-btn"
        title="Attach a file"
        aria-label="Attach file"
      >
        <img src="/1attach.svg" alt="Attach" className="icon" />
      </button>
    </div>
  );
};

export default MessageInput;