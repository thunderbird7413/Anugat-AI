import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, ToggleButton, ToggleButtonGroup,
  Typography, Box, IconButton, Paper
} from '@mui/material';
import { CloudUpload, Close as CloseIcon } from '@mui/icons-material';

const UploadModal = ({ onClose, onSubmit, currentFolder }) => {
  const [contentData, setContentData] = useState({
    title: '',
    type: 'pdf',
    content: '',
    link: ''
  });

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    setContentData({
      ...contentData,
      [e.target.name]: e.target.value
    });
  };

  const handleTypeChange = (_, newType) => {
    if (newType) {
      setContentData({
        ...contentData,
        type: newType
      });
      if (['text', 'link'].includes(newType)) {
        setFile(null);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0] &&
        !['text', 'link'].includes(contentData.type)) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (selectedFile) => {
    if (!contentData.title) {
      setContentData({
        ...contentData,
        title: selectedFile.name.split('.')[0]
      });
    }
    setFile(selectedFile);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(contentData, file);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" onDragEnter={handleDrag}>
      <DialogTitle>
        Upload Content
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit} onDrop={handleDrop}>
        <DialogContent dividers>
          <Box mb={2}>
            <TextField
              fullWidth
              required
              name="title"
              label="Content Title"
              value={contentData.title}
              onChange={handleChange}
            />
          </Box>

          <Box mb={2}>
            <Typography variant="subtitle1">Content Type</Typography>
            <ToggleButtonGroup
              color="primary"
              value={contentData.type}
              exclusive
              onChange={handleTypeChange}
              fullWidth
              sx={{ mt: 1 }}
            >
              <ToggleButton value="pdf">PDF</ToggleButton>
              <ToggleButton value="text">Text</ToggleButton>
              <ToggleButton value="image">Image</ToggleButton>
              <ToggleButton value="video">Video</ToggleButton>
              <ToggleButton value="link">Link</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box mb={2}>
            <Typography variant="subtitle1">Upload to Folder</Typography>
            <Typography color="text.secondary">
              {currentFolder?.name || 'Repository Root'}
            </Typography>
          </Box>

          {/* Conditional Inputs */}
          {contentData.type === 'text' ? (
            <TextField
              name="content"
              label="Text Content"
              value={contentData.content}
              onChange={handleChange}
              multiline
              rows={6}
              fullWidth
              required
            />
          ) : contentData.type === 'link' ? (
            <TextField
              name="link"
              label="URL"
              value={contentData.link}
              onChange={handleChange}
              fullWidth
              type="url"
              required
            />
          ) : (
            <>
              <Typography variant="subtitle1" gutterBottom>Upload File</Typography>
              {file ? (
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="body1" fontWeight="bold">{file.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatFileSize(file.size)} • Ready to upload
                  </Typography>
                  <Button variant="outlined" size="small" sx={{ mt: 1 }} onClick={() => setFile(null)}>
                    Change File
                  </Button>
                </Paper>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    borderColor: dragActive ? 'primary.main' : 'divider',
                    bgcolor: dragActive ? 'action.hover' : 'background.paper',
                    transition: 'background 0.2s ease'
                  }}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                >
                  <CloudUpload sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="body1">Drag and drop file here, or</Typography>
                  <Button component="label" variant="contained" sx={{ mt: 1 }}>
                    Choose File
                    <input
                      type="file"
                      hidden
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                      }}
                      accept={
                        contentData.type === 'pdf' ? '.pdf' :
                        contentData.type === 'image' ? 'image/*' :
                        contentData.type === 'video' ? 'video/*' : '*'
                      }
                    />
                  </Button>
                </Paper>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} variant="outlined">Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={
              !contentData.title ||
              (contentData.type === 'text' && !contentData.content) ||
              (contentData.type === 'link' && !contentData.link) ||
              (['pdf', 'image', 'video'].includes(contentData.type) && !file)
            }
          >
            Upload Content
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UploadModal;
