const chatService = require('../services/chatService');
const llmService = require('../services/llmService');

exports.validateApiKeys = async (req, res) => {
  try {
    const { selectedBots } = req.body;
    const validationResults = await llmService.validateApiKeys(selectedBots);
    res.json(validationResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.startChat = async (req, res) => {
  try {
    const { selectedBots, initialTopic, tokenLimits } = req.body;
    const chatSession = await chatService.createSession(selectedBots, initialTopic, tokenLimits);
    res.json(chatSession);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBotResponse = async (req, res) => {
  try {
    const { sessionId, botId } = req.body;
    const response = await chatService.getNextBotResponse(sessionId, botId);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.handleUserInput = async (req, res) => {
  try {
    const { sessionId, userInput } = req.body;
    const updatedSession = await chatService.addUserInput(sessionId, userInput);
    res.json(updatedSession);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};