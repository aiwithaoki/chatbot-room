const { v4: uuidv4 } = require('uuid');
const llmService = require('./llmService');

// In-memory storage for chat sessions 
// (In production, you'd use a database instead)
const chatSessions = {};

// Create a new chat session
exports.createSession = async (selectedBots, initialTopic, tokenLimits) => {
  const sessionId = uuidv4();
  
  const bots = selectedBots.map(bot => ({
    ...bot,
    tokenLimit: tokenLimits[bot.id] || 500, // Default token limit if not specified
  }));
  
  chatSessions[sessionId] = {
    id: sessionId,
    bots,
    messages: [
      { role: 'user', content: initialTopic }
    ],
    currentBotIndex: 0
  };
  
  return chatSessions[sessionId];
};

// Get the next bot response
exports.getNextBotResponse = async (sessionId, botId) => {
  const session = chatSessions[sessionId];
  
  if (!session) {
    throw new Error('Chat session not found');
  }
  
  let botIndex;
  if (botId) {
    // If a specific bot is requested
    botIndex = session.bots.findIndex(bot => bot.id === botId);
    if (botIndex === -1) {
      throw new Error('Bot not found in this session');
    }
  } else {
    // Use the current bot in the rotation
    botIndex = session.currentBotIndex;
  }
  
  const bot = session.bots[botIndex];
  
  // Prepare messages for the LLM API
  const messages = [
    { role: 'system', content: 'you are a happy conversation bot' },
    ...session.messages
  ];
  
  // Call the appropriate LLM API
  const response = await llmService.callLLM(
    bot.provider,
    bot.apiKey,
    messages,
    bot.tokenLimit
  );
  
  // Add the bot's response to the conversation
  session.messages.push({
    role: 'assistant',
    content: response,
    botId: bot.id,
    botName: bot.name
  });
  
  // Update the current bot index for next turn
  session.currentBotIndex = (botIndex + 1) % session.bots.length;
  
  return {
    sessionId,
    botResponse: {
      botId: bot.id,
      botName: bot.name,
      content: response
    },
    nextBotIndex: session.currentBotIndex
  };
};

// Add user input to the conversation
exports.addUserInput = async (sessionId, userInput) => {
  const session = chatSessions[sessionId];
  
  if (!session) {
    throw new Error('Chat session not found');
  }
  
  // Add user input to messages
  session.messages.push({
    role: 'user',
    content: userInput
  });
  
  return session;
};