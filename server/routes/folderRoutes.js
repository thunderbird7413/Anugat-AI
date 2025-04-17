const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const { protect } = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
// router.use(protect);

// Folder routes
router.post('/', protect, folderController.createFolder);
router.get('/', protect, folderController.getFolders);
router.get('/search', protect, folderController.searchFolders);


// Add this new route BEFORE the /:id route
router.get('/byPath', protect, folderController.getFolderByPath);


router.get('/:id', protect, folderController.getFolderWithContents);
router.delete('/:id', protect, folderController.deleteFolder);

module.exports = router;