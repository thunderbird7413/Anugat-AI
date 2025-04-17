const Folder = require('../models/Folder');
const Content = require('../models/Content');

// Create a new folder
exports.createFolder = async (req, res) => {
  try {
    const { name, description, parentFolderId } = req.body;
    
    // Create folder data
    const folderData = {
      name,
      description,
      owner: req.user._id
    };
    
    // If it has a parent folder
    if (parentFolderId) {
      const parentFolder = await Folder.findById(parentFolderId);
      
      // Check if parent folder exists and belongs to user
      if (!parentFolder || parentFolder.owner.toString() !== req.user._id.toString()) {
        return res.status(404).json({ error: 'Parent folder not found' });
      }
      
      folderData.parentFolder = parentFolderId;
      folderData.path = `${parentFolder.path}/${name}`;
    } else {
      // Root level folder
      folderData.path = `/${name}`;
    }
    
    const newFolder = new Folder(folderData);
    await newFolder.save();
    
    res.status(201).json(newFolder);
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
};

// Get folders (with optional parent folder filter)
// exports.getFolders = async (req, res) => {
//   try {
//     const { parentId } = req.query;
//     const query = { owner: req.user._id };
    
//     // If parentId is provided, filter by parent
//     if (parentId) {
//       query.parentFolder = parentId;
//     } else {
//       // Return root folders (those with no parent)
//       query.parentFolder = null;
//     }
    
//     const folders = await Folder.find(query).sort({ name: 1 });
//     res.json(folders);
//   } catch (error) {
//     console.error('Error fetching folders:', error);
//     res.status(500).json({ error: 'Failed to fetch folders' });
//   }
// };

exports.getFolders = async (req, res) => {
    try {
      const { parentId } = req.query;
      const query = { owner: req.user._id };
  
      // If parentId is provided, filter by parent, otherwise treat it as null
      if (parentId) {
        query.parentFolder = parentId === 'null' ? null : parentId;  // Ensure 'null' string is converted to actual null
      } else {
        query.parentFolder = null; // Root level folders have parentFolder as null
      }
  
      const folders = await Folder.find(query).sort({ name: 1 });
      res.json(folders);
    } catch (error) {
      console.error('Error fetching folders:', error);
      res.status(500).json({ error: 'Failed to fetch folders' });
    }
  };
  

// Get folder by ID with its contents
exports.getFolderWithContents = async (req, res) => {
  try {

    // console.log("hello");
    const folderId = req.params.id;
    // console.log(folderId);
    
    // Get the folder
    // console.log(req.user._id);
    const folder = await Folder.findOne({ 
      _id: folderId,
      owner: req.user._id
    });
    
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    // Get subfolders
    const subfolders = await Folder.find({
      parentFolder: folderId,
      owner: req.user._id
    }).sort({ name: 1 });
    
    // Get contents in this folder
    const contents = await Content.find({
      folder: folderId,
      owner: req.user._id
    }).sort({ createdAt: -1 });
    
    res.json({
      folder,
      subfolders,
      contents
    });
  } catch (error) {
    console.error('Error fetching folder:', error);
    res.status(500).json({ error: 'Failed to fetch folder' });
  }
};

exports.getFolderByPath = async (req, res) => {
    try {
      const folderPath = req.query.path;
      
      if (!folderPath) {
        return res.status(400).json({ error: 'Path is required' });
      }
      
      const folder = await Folder.findOne({ 
        path: folderPath,
        owner: req.user._id
      });
      
      if (!folder) {
        return res.status(404).json({ error: 'Folder not found' });
      }
      
      res.json(folder);
    } catch (error) {
      console.error('Error fetching folder by path:', error);
      res.status(500).json({ error: 'Failed to fetch folder by path' });
    }
  };
  

// Delete folder and all its contents
exports.deleteFolder = async (req, res) => {
  try {
    const folderId = req.params.id;
    
    // Get the folder
    const folder = await Folder.findOne({
      _id: folderId,
      owner: req.user._id
    });
    
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    // Recursively delete subfolders and their contents
    await deleteSubfoldersRecursively(folderId, req.user._id);
    
    // Delete the folder itself
    await Folder.findByIdAndDelete(folderId);
    
    res.json({ message: 'Folder and contents deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
};

// Helper function for recursive deletion
async function deleteSubfoldersRecursively(folderId, userId) {
  // Find all subfolders
  const subfolders = await Folder.find({ 
    parentFolder: folderId,
    owner: userId
  });
  
  // For each subfolder, recursively delete its subfolders
  for (const subfolder of subfolders) {
    await deleteSubfoldersRecursively(subfolder._id, userId);
  }
  
  // Delete all contents in this folder
  await Content.deleteMany({ 
    folder: folderId,
    owner: userId
  });
  
  // Delete all subfolders
  await Folder.deleteMany({
    parentFolder: folderId,
    owner: userId
  });
}

// Search folders by name
exports.searchFolders = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const folders = await Folder.find({
      owner: req.user._id,
      name: { $regex: query, $options: 'i' }
    }).sort({ path: 1 });
    
    res.json(folders);
  } catch (error) {
    console.error('Error searching folders:', error);
    res.status(500).json({ error: 'Failed to search folders' });
  }
};