const fs = require('fs/promises');
const Content = require('../models/Content');
const Folder = require('../models/Folder');
const { generateEmbeddings } = require('../utils/embeddingGenerator');
const { uploadFile } = require('../utils/fileUpload');
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const mongoose = require("mongoose");

exports.uploadContent = async (req, res) => {
  try {
    const { title, type, folderId } = req.body;
    const file = req.file;
    console.log(folderId);
    // Verify folder exists and belongs to user

    // Sanitize folderId
    if (folderId === 'null' || folderId === 'undefined') {
      folderId = null;
    }

    // Validate folderId format
    if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
      throw new Error('Invalid folder ID format');
    }

    // Check folder existence if ID provided
    let folder;
    if (folderId) {
      folder = await Folder.findOne({
        _id: folderId,
        owner: req.user._id
      });

      if (!folder) {
        if (file?.path) await fs.unlink(file.path);
        return res.status(404).json({ error: 'Folder not found' });
      }
    }

    let contentData = {
      title,
      type,
      folder: folderId,
      owner: req.user._id
    };

    // Handle file uploads
    if (type !== 'text') {
      // Get cloudinary folder path from MongoDB folder path
      const cloudinaryFolderPath = `user_${req.user._id}${folder.path}`;

      const uploadResult = await uploadFile(file, type, cloudinaryFolderPath);
      contentData.url = uploadResult.url;
      contentData.content = uploadResult.content;
    } else {
      contentData.content = req.body.content;
    }

    // Generate embeddings
    const embeddings = await generateEmbeddings(contentData.content);
    contentData.embeddings = embeddings;

    const newContent = new Content(contentData);
    await newContent.save();

    // After successful upload
    if (req.file?.path) {
      await fs.unlink(req.file.path); // Delete temp file
    }

    res.status(201).json(newContent);
  } catch (error) {
    // Clean up temp file on error too
    if (req.file?.path) await fs.unlink(req.file.path);
    console.error('Error uploading content:', error);
    res.status(500).json({ error: 'Failed to upload content' });
  }
};

exports.getContents = async (req, res) => {
  try {
    const { folderId } = req.query;

    // Build query - always filter by owner
    const query = { owner: req.user._id };

    // If folder ID provided, filter by folder
    if (folderId) {
      query.folder = folderId;
    }

    const contents = await Content.find(query)
      .sort({ createdAt: -1 }) // Sort by creation time descending
      .populate('folder', 'name path'); // Include folder info

    res.json(contents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contents' });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    // Verify content exists and belongs to user before deleting
    const content = await Content.findOne({
      _id: req.params.id,
      owner: req.user._id
    });


    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    await Content.findByIdAndDelete(req.params.id);
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete content' });
  }
};

// New method to search content across folders
exports.searchContent = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const contents = await Content.find({
      owner: req.user._id,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('folder', 'name path');

    res.json(contents);
  } catch (error) {
    console.error('Error searching content:', error);
    res.status(500).json({ error: 'Failed to search content' });
  }
};