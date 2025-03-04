import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/chat';

// Validate API keys
export const validateApiKeys = async (selectedBots) => {
  const response = await axios.post(`${API_BASE_URL}/validate`, { selectedBots });
  return response.data;
};

// Start a new chat session
export const startChat = async (selectedBots, initialTopic, tokenLimits) => {
  const response = await axios.post(`${API_BASE_URL}/start`, {
    selectedBots,
    initialTopic,
    tokenLimits
  });
  return response.data;
};

// Get response from a bot
export const getBotResponse = async (sessionId, botId) => {
  const response = await axios.post(`${API_BASE_URL}/response`, {
    sessionId,
    botId
  });
  return response.data;
};

// Send user input
export const sendUserInput = async (sessionId, userInput) => {
  const response = await axios.post(`${API_BASE_URL}/user-input`, {
    sessionId,
    userInput
  });
  return response.data;
};