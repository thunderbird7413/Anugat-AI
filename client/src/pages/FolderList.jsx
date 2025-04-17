import React from 'react';
import { Folder } from '@mui/icons-material';
import { Box, Card, CardContent, Typography, IconButton, Avatar } from '@mui/material';

const FolderList = ({ folders, onFolderClick }) => {
  return (
    <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={2} sx={{ p: 2 }}>
      {folders.map(folder => (
        <Card 
          key={folder._id} 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': {
              boxShadow: 6, 
              transform: 'scale(1.05)', 
              transition: 'transform 0.3s ease-in-out'
            }
          }}
          onClick={() => onFolderClick(folder._id)}
        >
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {/* Folder Icon */}
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <Folder sx={{ fontSize: 32, color: 'white' }} />
            </Avatar>
            
            {/* Folder Name */}
            <Typography variant="h6" sx={{ mt: 2 }}>
              {folder.name}
            </Typography>

            {/* Folder Metadata */}
            <Typography variant="body2" color="text.secondary">
              {new Date(folder.createdAt).toLocaleDateString()}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default FolderList;
