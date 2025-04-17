import React from 'react';
import { Box, Card, CardContent, Typography, IconButton, Chip, Stack } from '@mui/material';
import { DocumentIcon, ImageIcon, VideoIcon, LinkIcon, TextIcon, TrashIcon, EyeIcon } from './Icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';



const ContentList = ({ contents, onDeleteContent }) => {
  const { authToken } = useAuth();

  // Helper to get appropriate icon for content type
  const getContentIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <DocumentIcon size={24} />;
      case 'image':
        return <ImageIcon size={24} />;
      case 'video':
        return <VideoIcon size={24} />;
      case 'link':
        return <LinkIcon size={24} />;
      case 'text':
        return <TextIcon size={24} />;
      default:
        return <DocumentIcon size={24} />;
    }
  };

  // Helper to format file size
  const formatSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };


  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/content/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      }).then(() => onDeleteContent(id))
        .catch(err => console.error('Error deleting content:', err));
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  return (
    <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={2} sx={{ p: 2 }}>
      {contents.map(content => (
        <Card key={content._id} sx={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', '&:hover': { boxShadow: 6, transform: 'scale(1.05)', transition: 'transform 0.3s ease-in-out' } }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Box sx={{ mr: 2 }}>
              {getContentIcon(content.type)}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">{content.title}</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={content.type.toUpperCase()} size="small" color="primary" />
                <Typography variant="body2" color="text.secondary">Added {new Date(content.createdAt).toLocaleDateString()}</Typography>
              </Stack>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <IconButton color="primary" onClick={() => window.open(content.url, '_blank')} title="View">
                <EyeIcon />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this item?')) {
                    // axios.delete(`/api/content/${id}`, {
                    //   headers: { Authorization: `Bearer ${authToken}` }
                    // })
                    //   .then(() => onDeleteContent(content._id))
                    //   .catch(err => console.error('Error deleting content:', err));
                    handleDelete(content._id)
                  }
                }}
                title="Delete"
              >
                <TrashIcon />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      ))
      }
    </Box >
  );
};

export default ContentList;
