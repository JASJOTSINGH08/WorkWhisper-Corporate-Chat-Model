import React from 'react';
import { useTheme } from '../providers/ThemeProvider';
import { useAuth } from '../providers/AuthProvider';
import './MessageBubble.css';

const MessageBubble = ({ text, sender, timestamp, fileName }) => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const bubbleType = sender;
  const isImage = fileName && /\.(jpg|jpeg|png|gif)$/i.test(fileName);
  const isDocument = fileName && /\.(pdf|doc|docx|ppt|pptx)$/i.test(fileName);
  const isFile = fileName && !isImage && !isDocument;

  const bubbleBackground =
    bubbleType === 'sent'
      ? theme === 'dark'
        ? 'bg-blue-600 text-white'
        : 'bg-blue-200 text-black'
      : theme === 'dark'
      ? 'bg-gray-700 text-white'
      : 'bg-gray-300 text-black';

  const fileUrl = text.startsWith('http') ? text : `http://localhost:8081/${text}`;

  return (
    <div className={`message-bubble ${bubbleType} mb-3`}>
      <div className={`message-content p-3 rounded-lg max-w-xs ${bubbleBackground}`}>
        {fileName ? (
          isImage ? (
            <img
              src={fileUrl}
              alt={fileName}
              className="chat-image"
              style={{ maxWidth: '200px', borderRadius: '8px' }}
              onError={(e) => (e.target.style.display = 'none')}
            />
          ) : (
            <a
              href={fileUrl}
              download={fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="chat-file-link"
              title={`Download ${fileName}`}
            >
              {isDocument ? '📎' : '📦'} {fileName}
            </a>
          )
        ) : (
          <div className="message-text">{text}</div>
        )}
        <div className="message-time text-xs mt-1 opacity-75">{timestamp}</div>
      </div>
    </div>
  );
};

export default MessageBubble;
