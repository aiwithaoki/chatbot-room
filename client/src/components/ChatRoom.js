import React, { useState, useEffect, useRef } from 'react';
import { getBotResponse, sendUserInput } from '../services/apiService';
import MessageBubble from './MessageBubble';

function ChatRoom({ session, onEndChat }) {
  const [messages, setMessages] = useState(session.messages || []);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentBotIndex, setCurrentBotIndex] = useState(0);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const fetchNextBotResponse = async () => {
    setLoading(true);
    setError('');
    
    try {
      const nextBot = session.bots[currentBotIndex];
      const response = await getBotResponse(session.id, nextBot.id);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.botResponse.content,
        botId: response.botResponse.botId,
        botName: response.botResponse.botName
      }]);
      
      setCurrentBotIndex(response.nextBotIndex);
    } catch (err) {
      setError(`Error getting bot response: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    setLoading(true);
    
    try {
      // Add user message to the conversation
      const newUserMessage = { role: 'user', content: userInput };
      setMessages(prev => [...prev, newUserMessage]);
      
      // Send to backend
      await sendUserInput(session.id, userInput);
      
      // Clear input
      setUserInput('');
      
      // Get next bot response
      await fetchNextBotResponse();
    } catch (err) {
      setError(`Error sending message: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSkip = async () => {
    await fetchNextBotResponse();
  };
  
  const getCurrentBotName = () => {
    const bot = session.bots[currentBotIndex];
    return bot ? bot.name : '';
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <h2>Chat Room</h2>
        <div className="bot-rotation">
          Next: <span className="next-bot">{getCurrentBotName()}</span>
        </div>
        <button className="end-chat-btn" onClick={onEndChat}>
          End Chat
        </button>
      </div>
      
      <div className="messages-container">
        {messages.map((msg, index) => (
          <MessageBubble
            key={index}
            message={msg}
            isUser={msg.role === 'user'}
          />
        ))}
        {loading && <div className="loading-indicator">Bot is thinking...</div>}
        {error && <div className="error-message">{error}</div>}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-controls">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <div className="button-group">
          <button 
            className="send-button"
            onClick={handleSendMessage} 
            disabled={!userInput.trim() || loading}
          >
            Send
          </button>
          <button 
            className="skip-button"
            onClick={handleSkip} 
            disabled={loading}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatRoom;