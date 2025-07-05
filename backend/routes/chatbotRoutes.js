const express = require('express');
const router = express.Router();
const { handleNewMessage } = require('../controllers/chatbotController');

// Route for handling chatbot messages
router.post('/message', handleNewMessage);

module.exports = router;