// With notification
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { Delete, CloudUpload } from '@mui/icons-material';

const ContentManager = () => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('text');
  const [content, setContent] = useState('');
  const [folder, setFolder] = useState('General');
  const [file, setFile] = useState(null);
  const [uploadLoading, setuploadLoading] = useState(false);
  const [contentLoading, setcontentLoading] = useState(false);
  const [contents, setContents] = useState([]);
  const [toastOpen, setToastOpen] = useState(false); // for Snackbar
  const { authToken } = useAuth();

  const folders = ['General', 'Admissions', 'Courses', 'Events', 'Faculty', 'Policies'];

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    setcontentLoading(true);
    try {
      const response = await axios.get('/api/content', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setContents(response.data);
      setcontentLoading(false);
    } catch (error) {
      console.error('Error fetching contents:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setuploadLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', type);
    formData.append('folder', folder);

    if (type === 'text') {
      formData.append('content', content);
    } else if (file) {
      formData.append('file', file);
    }

    try {
      await axios.post('/api/content/upload', formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      await fetchContents();
      setTitle('');
      setContent('');
      setFile(null);
      setToastOpen(true); // Show toast
    } catch (error) {
      console.error('Error uploading content:', error);
    } finally {
      setuploadLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/content/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      fetchContents();
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Knowledge Repository</Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Add New Content</Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="image">Image</MenuItem>
              <MenuItem value="video">Video</MenuItem>
              <MenuItem value="link">Web Link</MenuItem>
            </Select>

            <Select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              required
            >
              {folders.map(folder => (
                <MenuItem key={folder} value={folder}>{folder}</MenuItem>
              ))}
            </Select>

            {type === 'text' ? (
              <TextField
                label="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                multiline
                rows={4}
                required
              />
            ) : (
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
              >
                Upload {type.toUpperCase()} File
                <input
                  type="file"
                  hidden
                  accept={
                    type === 'pdf' ? 'application/pdf' :
                      type === 'image' ? 'image/*' :
                        type === 'video' ? 'video/*' : '*'
                  }
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                />
              </Button>
            )}

            {file && <Typography variant="body2">{file.name}</Typography>}

            <Button
              type="submit"
              variant="contained"
              disabled={uploadLoading}
              sx={{ alignSelf: 'flex-start' }}
            >
              {uploadLoading ? <CircularProgress size={24} /> : 'Upload Content'}
            </Button>
          </Box>
        </form>
      </Paper>

      <div style={{display: "flex", justifyContent: "space-between"}}>
        <Typography variant="h5" gutterBottom>Your Content </Typography>
        <div>
        {contentLoading ? <CircularProgress size={24} /> : ''}
        </div>
      </div>
      <List>
        {contents.map(item => (
          <Paper key={item._id} sx={{ mb: 1 }}>
            <ListItem
              secondaryAction={
                <IconButton edge="end" onClick={() => handleDelete(item._id)}>
                  <Delete color="error"/>
                </IconButton>
              }
            >
              <ListItemText
                primary={item.title}
                secondary={`Type: ${item.type} | Folder: ${item.folder}`}
              />
            </ListItem>
          </Paper>
        ))}
      </List>

      {/* Used Snackbar for toast notification*/}
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setToastOpen(false)} sx={{ width: '100%' }}>
          Content uploaded successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContentManager;
