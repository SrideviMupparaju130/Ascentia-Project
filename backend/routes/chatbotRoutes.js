// In your routes file (e.g., chatbotRoutes.js)
const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const authMiddleware = require('../middleware/authenticate'); // Your JWT auth middleware

router.post('/message', authMiddleware, chatbotController.handleMessage);

module.exports = router;