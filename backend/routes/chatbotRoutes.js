<<<<<<< HEAD
// In your routes file (e.g., chatbotRoutes.js)
const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const authMiddleware = require('../middleware/authenticate'); // Your JWT auth middleware

router.post('/message', authMiddleware, chatbotController.handleMessage);
=======
const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const authenticate = require('../middleware/authenticate'); // Assuming you have this

router.post('/message', authenticate, chatbotController.handleMessage);
>>>>>>> 8fd30af78489fc0a53f3d845f8f085afb3032478

module.exports = router;