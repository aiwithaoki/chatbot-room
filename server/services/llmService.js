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
  console.log('⭐ validateApiKeys called with:', JSON.stringify(selectedBots.map(bot => ({
    id: bot.id,
    provider: bot.provider,
    keyLength: bot.apiKey ? bot.apiKey.length : 0
  }))));
  
  const results = {};
  
  for (const bot of selectedBots) {
    try {
      console.log(`🔍 Validating key for ${bot.name} (${bot.provider})`);
      // Make a minimal API call to validate the key
      const isValid = await validateSingleApiKey(bot.provider, bot.apiKey);
      results[bot.id] = isValid;
      console.log(`✅ Key validation for ${bot.name}: ${isValid ? 'Valid' : 'Invalid'}`);
    } catch (error) {
      console.error(`❌ Error validating ${bot.provider} API key:`, error.message);
      results[bot.id] = false;
    }
  }
  
  console.log('🔄 Validation results:', results);
  return results;
};

// Call appropriate LLM API based on the provider
exports.callLLM = async (provider, apiKey, messages, tokenLimit) => {
  console.log(`⭐ callLLM called for provider: ${provider}`);
  console.log(`📝 Token limit: ${tokenLimit}`);
  console.log(`💬 Messages count: ${messages.length}`);
  
  const config = apiConfigs[provider];
  
  if (!config) {
    console.error(`❌ Unsupported provider: ${provider}`);
    throw new Error(`Unsupported LLM provider: ${provider}`);
  }
  
  try {
    let response;
    console.log(`📡 Making API call to ${provider} at ${config.baseURL}`);
    
    if (provider === 'openai') {
      const requestData = {
        model: config.model,
        messages,
        max_tokens: tokenLimit
      };
      
      console.log(`📄 OpenAI request data:`, JSON.stringify(requestData, null, 2));
      
      response = await axios.post(
        config.baseURL,
        requestData,
        { headers: config.headers(apiKey) }
      );
      
      console.log(`✅ OpenAI response received`);
      return response.data.choices[0].message.content;
    } 
    else if (provider === 'anthropic') {
      const systemPrompt = getSystemPrompt(messages);
      const formattedMessages = formatMessagesForAnthropic(messages);
      
      const requestData = {
        model: config.model,
        system: systemPrompt,
        messages: formattedMessages,
        max_tokens: tokenLimit
      };
      
      console.log(`📄 Anthropic request data:`, JSON.stringify(requestData, null, 2));
      
      response = await axios.post(
        config.baseURL,
        requestData,
        { headers: config.headers(apiKey) }
      );
      
      console.log(`✅ Anthropic response received`);
      return response.data.content[0].text;
    } 
    else if (provider === 'deepseek') {
      const requestData = {
        model: config.model,
        messages,
        max_tokens: tokenLimit
      };
      
      console.log(`📄 Deepseek request data:`, JSON.stringify(requestData, null, 2));
      
      response = await axios.post(
        config.baseURL,
        requestData,
        { headers: config.headers(apiKey) }
      );
      
      console.log(`✅ Deepseek response received`);
      return response.data.choices[0].message.content;
    }
  } catch (error) {
    console.error('❌ LLM API Error Details:');
    console.error(`Provider: ${provider}`);
    console.error(`URL: ${config.baseURL}`);
    console.error(`Status: ${error.response?.status}`);
    console.error(`Response data:`, error.response?.data);
    console.error(`Error message:`, error.message);
    
    throw new Error(`Failed to get response from ${provider}: ${error.message}`);
  }
};

// Extract system prompt from messages array
const getSystemPrompt = (messages) => {
  const systemMessage = messages.find(msg => msg.role === 'system');
  const prompt = systemMessage ? systemMessage.content : 'you are a happy conversation bot';
  console.log(`🔧 Using system prompt: "${prompt}"`);
  return prompt;
};

// Format messages for Anthropic's API which has different structure
const formatMessagesForAnthropic = (messages) => {
  // Remove system messages as they are handled separately in Anthropic's API
  const formatted = messages
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  
  console.log(`🔄 Formatted ${messages.length} messages to ${formatted.length} messages for Anthropic`);
  return formatted;
};

// Helper function to validate a single API key
const validateSingleApiKey = async (provider, apiKey) => {
  console.log(`🔑 Validating key for provider: ${provider}`);
  
  // For development, just check if key looks reasonable
  if (!apiKey || apiKey.length < 10) {
    console.log(`❌ Key too short or empty`);
    return false;
  }
  
  // In a production environment, you'd check with a minimal API call
  // For now, we'll simulate success
  console.log(`✅ Key validation passed (simulated)`);
  return true;
};