import React from 'react';

function MessageBubble({ message, isUser }) {
  return (
    <div className={`message-bubble ${isUser ? 'user-message' : 'bot-message'}`}>
      <div className="message-header">
        {isUser ? (
          <span className="user-name">You</span>
        ) : (
          <span className="bot-name">{message.botName}</span>
        )}
      </div>
      <div className="message-content">
        {message.content}
      </div>
    </div>
  );
}

export default MessageBubble;