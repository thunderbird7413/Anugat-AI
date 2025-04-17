const express = require('express');
const router = express.Router();
const { uploadContent, getContents, deleteContent, searchContent } = require('../controllers/contentController');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/authMiddleware');


// Use `protect` before controller
router.post('/upload', protect, upload.single('file'), uploadContent);
router.get('/', protect, getContents);
router.delete('/:id', protect, deleteContent);
router.get('/search', protect, searchContent);

module.exports = router;