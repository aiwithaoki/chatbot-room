import React, { useState } from 'react';
import { validateApiKeys, startChat } from '../services/apiService';

const AVAILABLE_BOTS = [
  { id: 'gpt4o', name: 'ChatGPT-4o', provider: 'openai' },
  { id: 'claude', name: 'Claude 3.7', provider: 'anthropic' },
  { id: 'deepseek', name: 'Deepseek R1', provider: 'deepseek' }
];

function SetupScreen({ onSessionCreated }) {
  const [selectedBots, setSelectedBots] = useState([]);
  const [apiKeys, setApiKeys] = useState({});
  const [tokenLimits, setTokenLimits] = useState({});
  const [initialTopic, setInitialTopic] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');

  const handleBotSelection = (botId) => {
    if (selectedBots.find(bot => bot.id === botId)) {
      setSelectedBots(selectedBots.filter(bot => bot.id !== botId));
    } else {
      const bot = AVAILABLE_BOTS.find(b => b.id === botId);
      setSelectedBots([...selectedBots, bot]);
    }
  };

  const handleApiKeyChange = (botId, value) => {
    setApiKeys({
      ...apiKeys,
      [botId]: value
    });
  };

  const handleTokenLimitChange = (botId, value) => {
    setTokenLimits({
      ...tokenLimits,
      [botId]: parseInt(value, 10)
    });
  };

  const handleStartChat = async () => {
    // Validation
    if (selectedBots.length === 0) {
      setError('Please select at least one bot');
      return;
    }

    if (!initialTopic) {
      setError('Please enter an initial topic');
      return;
    }

    for (const bot of selectedBots) {
      if (!apiKeys[bot.id]) {
        setError(`Please enter API key for ${bot.name}`);
        return;
      }
    }

    try {
      setValidating(true);
      setError('');

      // Prepare the bots with their API keys
      const botsWithKeys = selectedBots.map(bot => ({
        ...bot,
        apiKey: apiKeys[bot.id]
      }));

      // Validate API keys
      const validationResults = await validateApiKeys(botsWithKeys);
      
      // Check if all keys are valid
      const invalidBots = Object.entries(validationResults)
        .filter(([_, isValid]) => !isValid)
        .map(([botId]) => AVAILABLE_BOTS.find(b => b.id === botId).name);

      if (invalidBots.length > 0) {
        setError(`Invalid API keys for: ${invalidBots.join(', ')}`);
        setValidating(false);
        return;
      }

      // Start the chat session
      const session = await startChat(botsWithKeys, initialTopic, tokenLimits);
      onSessionCreated(session);
    } catch (err) {
      setError(`Failed to start chat: ${err.message}`);
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="setup-screen">
      <h2>Setup Chat</h2>
      
      <div className="section">
        <h3>Select Bots</h3>
        {AVAILABLE_BOTS.map(bot => (
          <div key={bot.id} className="bot-option">
            <label>
              <input
                type="checkbox"
                checked={selectedBots.some(b => b.id === bot.id)}
                onChange={() => handleBotSelection(bot.id)}
              />
              {bot.name}
            </label>
            
            {selectedBots.some(b => b.id === bot.id) && (
              <div className="bot-settings">
                <div className="form-group">
                  <label htmlFor={`api-key-${bot.id}`}>API Key:</label>
                  <input
                    id={`api-key-${bot.id}`}
                    type="password"
                    value={apiKeys[bot.id] || ''}
                    onChange={(e) => handleApiKeyChange(bot.id, e.target.value)}
                    placeholder={`Enter ${bot.name} API Key`}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`token-limit-${bot.id}`}>Token Limit:</label>
                  <input
                    id={`token-limit-${bot.id}`}
                    type="number"
                    value={tokenLimits[bot.id] || 500}
                    onChange={(e) => handleTokenLimitChange(bot.id, e.target.value)}
                    min="50"
                    max="2000"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="section">
        <h3>Initial Topic</h3>
        <textarea
          value={initialTopic}
          onChange={(e) => setInitialTopic(e.target.value)}
          placeholder="Enter a topic to start the conversation..."
          rows={3}
        />
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <button 
        onClick={handleStartChat} 
        disabled={validating || selectedBots.length === 0 || !initialTopic}
        className="primary-button"
      >
        {validating ? 'Validating...' : 'Start Chat'}
      </button>
    </div>
  );
}

export default SetupScreen;