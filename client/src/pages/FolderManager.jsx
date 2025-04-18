import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Chip,
  IconButton,
  CircularProgress,
  Stack,
  Divider,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import FolderList from './FolderList';
import ContentList from './ContentList';
import FolderModal from './FolderModal';
import UploadModal from './UploadModal';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Add, UploadFile, Search, Folder } from '@mui/icons-material';

const FolderManager = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { folderId } = useParams();
  const navigate = useNavigate();

  const [currentFolder, setCurrentFolder] = useState(null);
  const [folders, setFolders] = useState([]);
  const [contents, setContents] = useState([]);
  const [originalFolders, setOriginalFolders] = useState([]);
  const [originalContents, setOriginalContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([]);


  useEffect(() => {
    const fetchFolderData = async () => {
      setIsLoading(true);
      try {
        if (folderId) {
          const res = await axios.get(`${BASE_URL}/api/folders/${folderId}`);
          setCurrentFolder(res.data.folder);
          setFolders(res.data.subfolders);
          setOriginalFolders(res.data.subfolders); // Store original
          setContents(res.data.contents);
          setOriginalContents(res.data.contents); // Store original
          setSearchQuery(''); // Reset search query when changing folders

          const pathParts = res.data.folder.path.split('/').filter(Boolean);
          const breadcrumbData = await Promise.all(
            pathParts.map(async (part, index) => {
              const path = '/' + pathParts.slice(0, index + 1).join('/');
              const res = await axios.get(`${BASE_URL}/api/folders/byPath?path=${path}`);
              return { id: res.data._id, name: part };
            })
          );
          setBreadcrumbs(breadcrumbData);
        } else {
          const res = await axios.get(`${BASE_URL}/api/folders?parentId=null`);
          setFolders(res.data);
          setOriginalFolders(res.data); // Store original
          setContents([]);
          setOriginalContents([]); // Store original
          setCurrentFolder(null);
          setBreadcrumbs([]);
          setSearchQuery(''); // Reset search query
        }
      } catch (error) {
        console.error('Error fetching folder data:', error);
      }
      setIsLoading(false);
    };

    fetchFolderData();
  }, [folderId]);

  const handleCreateFolder = async (folderData) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/folders`, {
        ...folderData,
        parentFolderId: currentFolder ? currentFolder._id : null,
      });
      const newFolder = res.data;
      setFolders([...folders, newFolder]);
      setOriginalFolders([...originalFolders, newFolder]);
      setShowFolderModal(false);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleUploadContent = async (contentData, file) => {
    try {
      const formData = new FormData();
      formData.append('title', contentData.title);
      formData.append('type', contentData.type);

      // Handle folderId properly
      if (currentFolder && currentFolder._id) {
        formData.append('folderId', currentFolder._id);
      } else {
        formData.append('folderId', ''); // Explicit empty for root
      }

      if (contentData.type === 'text') {
        formData.append('content', contentData.content);
      } else if (contentData.type === 'link') {
        formData.append('content', contentData.link);
      } else if (file) {
        formData.append('file', file);
      }

      const res = await axios.post(`${BASE_URL}/api/content/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newContent = res.data;
      setContents([newContent, ...contents]);
      setOriginalContents([newContent, ...originalContents]);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading content:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    
    if (!query) {
      // If search is empty, reset to show all folders/contents
      setFolders(originalFolders);
      setContents(originalContents);
      return;
    }

    // Case-insensitive search
    const lowerCaseQuery = query.toLowerCase();

    // Filter folders by name
    const filteredFolders = originalFolders.filter(folder =>
      folder.name.toLowerCase().includes(lowerCaseQuery)
    );

    // Filter contents by title or content
    const filteredContents = originalContents.filter(content =>
      content.title.toLowerCase().includes(lowerCaseQuery) ||
      (content.content && content.content.toLowerCase().includes(lowerCaseQuery))
    );

    // Update state with filtered results
    setFolders(filteredFolders);
    setContents(filteredContents);
  };

  // Handle real-time search as user types
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    const query = e.target.value.trim();
    
    if (!query) {
      setFolders(originalFolders);
      setContents(originalContents);
      return;
    }
    
    // Case-insensitive search
    const lowerCaseQuery = query.toLowerCase();
    
    // Filter folders by name
    const filteredFolders = originalFolders.filter(folder =>
      folder.name.toLowerCase().includes(lowerCaseQuery)
    );
    
    // Filter contents by title or content
    const filteredContents = originalContents.filter(content =>
      content.title.toLowerCase().includes(lowerCaseQuery) ||
      (content.content && content.content.toLowerCase().includes(lowerCaseQuery))
    );
    
    setFolders(filteredFolders);
    setContents(filteredContents);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    
    if (filter === 'all') {
      // Reset to all contents for the current folder
      setContents(originalContents);
      return;
    }
    
    // Filter contents by type
    const filteredContents = originalContents.filter(content => 
      content.type === filter
    );
    
    setContents(filteredContents);
  };

  const handleDeleteContent = (id) => {
    setContents(contents.filter(c => c._id !== id));
    setOriginalContents(originalContents.filter(c => c._id !== id));
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator="/" aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink underline="hover" color="inherit" onClick={() => navigate('/repository')} sx={{ cursor: 'pointer' }}>
          Repository
        </MuiLink>
        {breadcrumbs.map((crumb, index) => (
          <MuiLink
            key={crumb.id}
            underline="hover"
            color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
            onClick={() => navigate(`/repository/folder/${crumb.id}`)}
            sx={{ cursor: 'pointer' }}
          >
            {crumb.name}
          </MuiLink>
        ))}
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Folder color="primary" />
          <Typography variant="h5">
            {currentFolder ? currentFolder.name : 'Repository Root'}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Add />} onClick={() => setShowFolderModal(true)}>
            New Folder
          </Button>
          <Button variant="contained" startIcon={<UploadFile />} onClick={() => setShowUploadModal(true)}>
            Upload
          </Button>
        </Stack>
      </Box>

      {/* Folder Metadata */}
      {currentFolder && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          {originalFolders.length} folders • {originalContents.length} files • Created{' '}
          {new Date(currentFolder.createdAt).toLocaleDateString()}
        </Typography>
      )}

      {/* Filters and Search */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
        <form onSubmit={handleSearch}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              placeholder="Search content..."
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchInputChange}
            />
            <IconButton type="submit" color="primary">
              <Search />
            </IconButton>
          </Stack>
        </form>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Folders */}
      {folders.length > 0 && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>Folders</Typography>
          <FolderList folders={folders} onFolderClick={(id) => navigate(`/repository/folder/${id}`)} />
        </Box>
      )}

      {/* Contents */}
      <Box>
        <Typography variant="h6" gutterBottom>Contents</Typography>
        {contents.length > 0 ? (
          <ContentList contents={contents} onDeleteContent={handleDeleteContent} />
        ) : (
          <Typography color="text.secondary" align="center" mt={4}>
            {searchQuery ? 'No matching content found.' : 'No content in this folder yet.'}
            <Box mt={2}>
              <Button variant="contained" onClick={() => setShowUploadModal(true)}>Upload Content</Button>
            </Box>
          </Typography>
        )}
      </Box>

      {/* Modals */}
      {showFolderModal && (
        <FolderModal
          onClose={() => setShowFolderModal(false)}
          onSubmit={handleCreateFolder}
          parentFolder={currentFolder}
        />
      )}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSubmit={handleUploadContent}
          currentFolder={currentFolder}
        />
      )}
    </Box>
  );
};

export default FolderManager;