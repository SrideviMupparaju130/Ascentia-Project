const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

const authenticate = require('../middleware/authenticate');

router.post('/message', authenticate, chatbotController.handleMessage);

module.exports = router;