const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

// Validate API keys for selected bots
router.post('/validate', chatController.validateApiKeys);

// Start a new chat session
router.post('/start', chatController.startChat);

// Get bot response
router.post('/response', chatController.getBotResponse);

// User input
router.post('/user-input', chatController.handleUserInput);

module.exports = router;