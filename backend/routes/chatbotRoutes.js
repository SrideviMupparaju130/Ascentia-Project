const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const authenticate = require('../middleware/authenticate'); // Assuming you have this

router.post('/message', authenticate, chatbotController.handleMessage);

module.exports = router;