import React, { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import ChatRoom from './components/ChatRoom';
import './App.css';

function App() {
  const [chatSession, setChatSession] = useState(null);
  
  const handleSessionCreated = (session) => {
    setChatSession(session);
  };
  
  const handleEndChat = () => {
    setChatSession(null);
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Chatroom</h1>
      </header>
      <main>
        {!chatSession ? (
          <SetupScreen onSessionCreated={handleSessionCreated} />
        ) : (
          <ChatRoom 
            session={chatSession} 
            onEndChat={handleEndChat} 
          />
        )}
      </main>
    </div>
  );
}

export default App;