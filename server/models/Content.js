const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['text', 'pdf', 'image', 'video', 'link'], required: true },
  content: { type: String },
  url: { type: String },
  folder: { type: String, required: true },
  embeddings: { type: Array },
  owner: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Content', ContentSchema);