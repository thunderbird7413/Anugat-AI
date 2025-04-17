const mongoose = require('mongoose');

const FolderSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  parentFolder: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Folder',
    default: null // null means it's a root folder
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  path: { 
    type: String, 
    required: true 
  }, // Store full path for easy searching (e.g., "/Admission Info/2024")
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add index for faster queries
FolderSchema.index({ owner: 1 });
FolderSchema.index({ path: 1 });

module.exports = mongoose.model('Folder', FolderSchema);