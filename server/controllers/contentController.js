const fs = require('fs/promises');
const Content = require('../models/Content');
const { generateEmbeddings } = require('../utils/embeddingGenerator');
const { uploadFile } = require('../utils/fileUpload');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.uploadContent = async (req, res) => {
  try {
    // console.log("uploading content");
    const { title, type, folder } = req.body;
    const file = req.file;
    let contentData = {
      title,
      type,
      folder,
      owner: req.user._id
    };
    
    // Handle file uploads
    if (type !== 'text') {
      const uploadResult = await uploadFile(file, type);
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
    if(req.file?.path){
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
    const contents = await Content.find({ owner: req.user.id }).sort({ createdAt: -1 }); // Sort by creation time descending;
    res.json(contents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contents' });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    await Content.findByIdAndDelete(req.params.id);
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete content' });
  }
};