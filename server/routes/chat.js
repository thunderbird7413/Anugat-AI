const express = require('express');
const router = express.Router();
const { generateResponse, chatHistory, gapSection, deleteChat } = require('../controllers/chatController');
const {protect} = require('../middleware/authMiddleware')

router.post('/', protect, generateResponse);
router.get('/chatHistory', protect, chatHistory);
router.post('/gaps', protect, gapSection);
router.delete('/:id', deleteChat);

module.exports = router;