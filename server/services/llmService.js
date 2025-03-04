const axios = require('axios');

// API configurations for different LLM providers
const apiConfigs = {
  openai: {
    baseURL: 'https://api.openai.com/v1/chat/completions',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    model: 'gpt-4o'
  },
  anthropic: {
    baseURL: 'https://api.anthropic.com/v1/messages',
    headers: (apiKey) => ({
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    }),
    model: 'claude-3-7-sonnet-20240219'
  },
  deepseek: {
    baseURL: 'https://api.deepseek.com/v1/chat/completions',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    model: 'deepseek-r1'
  }
};

// Validate API keys for selected bots
exports.validateApiKeys = async (selectedBots) => {
  const results = {};
  
  for (const bot of selectedBots) {
    try {
      // Make a minimal API call to validate the key
      const isValid = await validateSingleApiKey(bot.provider, bot.apiKey);
      results[bot.id] = isValid;
    } catch (error) {
      console.error(`Error validating ${bot.provider} API key:`, error.message);
      results[bot.id] = false;
    }
  }
  
  return results;
};

// Call appropriate LLM API based on the provider
exports.callLLM = async (provider, apiKey, messages, tokenLimit) => {
  const config = apiConfigs[provider];
  
  if (!config) {
    throw new Error(`Unsupported LLM provider: ${provider}`);
  }
  
  try {
    let response;
    
    if (provider === 'openai') {
      response = await axios.post(
        config.baseURL,
        {
          model: config.model,
          messages,
          max_tokens: tokenLimit
        },
        { headers: config.headers(apiKey) }
      );
      return response.data.choices[0].message.content;
    } 
    else if (provider === 'anthropic') {
      response = await axios.post(
        config.baseURL,
        {
          model: config.model,
          system: getSystemPrompt(messages),
          messages: formatMessagesForAnthropic(messages),
          max_tokens: tokenLimit
        },
        { headers: config.headers(apiKey) }
      );
      return response.data.content[0].text;
    } 
    else if (provider === 'deepseek') {
      response = await axios.post(
        config.baseURL,
        {
          model: config.model,
          messages,
          max_tokens: tokenLimit
        },
        { headers: config.headers(apiKey) }
      );
      return response.data.choices[0].message.content;
    }
  } catch (error) {
    console.error(`Error calling ${provider} API:`, error.response?.data || error.message);
    throw new Error(`Failed to get response from ${provider}: ${error.message}`);
  }
};

// Extract system prompt from messages array
const getSystemPrompt = (messages) => {
  const systemMessage = messages.find(msg => msg.role === 'system');
  return systemMessage ? systemMessage.content : 'you are a happy conversation bot';
};

// Format messages for Anthropic's API which has different structure
const formatMessagesForAnthropic = (messages) => {
  // Remove system messages as they are handled separately in Anthropic's API
  return messages
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      role: msg.role,
      content: msg.content
    }));
};

// Helper function to validate a single API key
const validateSingleApiKey = async (provider, apiKey) => {
  // For simplicity, we'll just return true for now
  // In a real implementation, you'd make a minimal API call to verify
  
  // Placeholder for actual API validation
  // Could be implemented with basic API calls to each service
  
  return true;
};