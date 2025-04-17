import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from '@mui/material';
import { XIcon } from './Icons';

const FolderModal = ({ onClose, onSubmit, parentFolder }) => {
  const [folderData, setFolderData] = useState({
    name: '',
    description: ''
  });
  
  const handleChange = (e) => {
    setFolderData({
      ...folderData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(folderData);
  };
  
  return (
    <Dialog open={true} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Create New Folder</Typography>
        <Button onClick={onClose} sx={{ padding: 0 }}>
          <XIcon size={20} />
        </Button>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            label="Folder Name *"
            name="name"
            value={folderData.name}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
            sx={{ marginBottom: 2 }}
          />
          
          <TextField
            label="Description (Optional)"
            name="description"
            value={folderData.description}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            sx={{ marginBottom: 2 }}
          />
          
          {parentFolder && (
            <Typography variant="body2" color="textSecondary">
              This folder will be created inside: <strong>{parentFolder.name}</strong>
            </Typography>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" type="submit">
            Create Folder
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FolderModal;
