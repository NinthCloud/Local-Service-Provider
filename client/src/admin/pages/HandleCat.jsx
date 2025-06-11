import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Typography,
  Chip,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
  useMediaQuery,
  FormHelperText,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import newRequest from "../../utils/newRequest";
import upload from "../../utils/upload";

function HandleCat() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // States
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [categoryToAction, setCategoryToAction] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '',
    cover: ''
  });
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const MAX_FILE_SIZE = 250 * 1024; // 250KB in bytes

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // API Calls
  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Updated route to fetch all categories
      const response = await newRequest.get('/admin/categories');
      setCategories(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch categories', 'error');
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async () => {
    try {
      let coverUrl = '';
      // Upload image if file exists
      if (file) {
        setUploading(true);
        coverUrl = await upload(file);
        setUploading(false);
      }

      // Construct the payload with image URL if uploaded
      const payload = {
        ...formData,
        cover: coverUrl || formData.cover
      };

      // Updated route for admin to create categories
      const response = await newRequest.post('/admin/categories', payload);
      setCategories([...categories, response.data]);
      resetForm();
      showSnackbar('Category created successfully');
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to create category', 'error');
      console.error('Error creating category:', error);
    }
  };

  const updateCategory = async () => {
    try {
      let coverUrl = formData.cover;
      // Upload new image if file exists
      if (file) {
        setUploading(true);
        coverUrl = await upload(file);
        setUploading(false);
      }

      // Construct the payload with image URL if uploaded
      const payload = {
        ...formData,
        cover: coverUrl
      };

      // Updated route for admin to update categories
      const response = await newRequest.put(`/admin/categories/${categoryToAction.id}`, payload);
      setCategories(categories.map(cat => cat.id === categoryToAction.id ? response.data : cat));
      resetForm();
      showSnackbar('Category updated successfully');
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to update category', 'error');
      console.error('Error updating category:', error);
    }
  };

  const toggleCategoryActive = async (category) => {
    try {
      // Updated route for admin to update category status
      const response = await newRequest.put(`/admin/categories/${category.id}`, {
        ...category,
        isActive: !category.isActive
      });
      setCategories(categories.map(cat => cat.id === category.id ? response.data : cat));
      showSnackbar(`Category ${response.data.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      showSnackbar('Failed to update category status', 'error');
      console.error('Error updating category status:', error);
    }
  };

  const deleteCategory = async () => {
    try {
      // Updated route for admin to delete categories
      await newRequest.delete(`/admin/categories/${categoryToAction.id}`);
      setCategories(categories.filter(cat => cat.id !== categoryToAction.id));
      setOpenDeleteDialog(false);
      showSnackbar('Category deleted successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete category';
      showSnackbar(message, 'error');
      console.error('Error deleting category:', error);
      setOpenDeleteDialog(false);
    }
  };

  // Event Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFileError('');
    
    if (!selectedFile) {
      setFile(null);
      setPreviewUrl('');
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError(`File size exceeds the limit of 250KB. Current size: ${(selectedFile.size / 1024).toFixed(2)}KB`);
      e.target.value = null;
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setFileError('Please upload a valid image file (JPEG, PNG, or WebP)');
      e.target.value = null;
      return;
    }

    // Create preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    setFile(selectedFile);
  };

  const handleOpenCreateDialog = () => {
    setIsEditing(false);
    setFormData({ name: '', description: '', cover: '' });
    setFile(null);
    setPreviewUrl('');
    setFileError('');
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (category) => {
    setIsEditing(true);
    setCategoryToAction(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      cover: category.cover || ''
    });
    setFile(null);
    setPreviewUrl(category.cover || '');
    setFileError('');
    setOpenDialog(true);
  };

  const handleOpenDeleteDialog = (category) => {
    setCategoryToAction(category);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCategoryToAction(null);
  };

  const handleSubmit = () => {
    if (isEditing) {
      updateCategory();
    } else {
      createCategory();
    }
    setOpenDialog(false);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', cover: '' });
    setCategoryToAction(null);
    setIsEditing(false);
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    setFileError('');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Render components
  const renderCategoryDialog = () => (
    <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Edit Category' : 'Create New Category'}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {isEditing 
            ? 'Update the category details below.'
            : 'Fill in the details to create a new category.'}
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Category Name"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.name}
          onChange={handleInputChange}
          required
          sx={{ mb: 2, mt: 2 }}
        />
        <TextField
          margin="dense"
          name="description"
          label="Description"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.description}
          onChange={handleInputChange}
          multiline
          rows={3}
          sx={{ mb: 3 }}
        />
        
        {/* Image Upload Section */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Category Image (Max 250KB)
          </Typography>
          
          <Box display="flex" flexDirection="column" alignItems="center" sx={{ mb: 2 }}>
            {previewUrl && (
              <Box sx={{ mb: 2 }}>
                <Avatar 
                  src={previewUrl} 
                  alt="Category preview" 
                  variant="rounded"
                  sx={{ width: 150, height: 150 }}
                />
              </Box>
            )}
            
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{ mt: 1 }}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            
            {fileError && (
              <FormHelperText error sx={{ mt: 1 }}>
                {fileError}
              </FormHelperText>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={formData.name.trim() === '' || uploading || !!fileError}
        >
          {uploading ? <CircularProgress size={24} /> : (isEditing ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderDeleteDialog = () => (
    <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete the category "{categoryToAction?.name}"? 
          This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDeleteDialog} color="inherit">Cancel</Button>
        <Button onClick={deleteCategory} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderCategoryTable = () => (
    <TableContainer component={Paper} elevation={3}>
      <Table sx={{ minWidth: isTablet ? 500 : 650 }} aria-label="categories table">
        <TableHead>
          <TableRow>
            <TableCell><Typography variant="subtitle2">Image</Typography></TableCell>
            <TableCell><Typography variant="subtitle2">Name</Typography></TableCell>
            {!isMobile && <TableCell><Typography variant="subtitle2">Description</Typography></TableCell>}
            <TableCell align="center"><Typography variant="subtitle2">Status</Typography></TableCell>
            <TableCell align="center"><Typography variant="subtitle2">Actions</Typography></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(rowsPerPage > 0
            ? categories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : categories
          ).map((category) => (
            <TableRow key={category.id} hover>
              <TableCell>
                {category.cover ? (
                  <Avatar 
                    src={category.cover} 
                    alt={category.name}
                    variant="rounded"
                    sx={{ width: 50, height: 50 }}
                  />
                ) : (
                  <Avatar 
                    variant="rounded"
                    sx={{ width: 50, height: 50, bgcolor: 'grey.300' }}
                  >
                    <ImageIcon />
                  </Avatar>
                )}
              </TableCell>
              <TableCell sx={{ maxWidth: 150 }}>
                <Typography noWrap>{category.name}</Typography>
              </TableCell>
              {!isMobile && (
                <TableCell sx={{ maxWidth: 250 }}>
                  <Typography noWrap>
                    {category.description || '-'}
                  </Typography>
                </TableCell>
              )}
              <TableCell align="center">
                <Chip 
                  label={category.isActive ? 'Active' : 'Inactive'} 
                  color={category.isActive ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell align="center">
                <Box>
                  <Tooltip title="Edit">
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleOpenEditDialog(category)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={category.isActive ? 'Deactivate' : 'Activate'}>
                    <IconButton 
                      size="small" 
                      color={category.isActive ? 'warning' : 'success'}
                      onClick={() => toggleCategoryActive(category)}
                    >
                      {category.isActive ? 
                        <VisibilityOffIcon fontSize="small" /> : 
                        <VisibilityIcon fontSize="small" />
                      }
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleOpenDeleteDialog(category)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
          {!loading && categories.length === 0 && (
            <TableRow>
              <TableCell colSpan={isMobile ? 4 : 5} align="center">
                <Typography variant="body1" color="textSecondary" py={3}>
                  No categories found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={categories.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );

  // Mobile Card View
  const renderCategoryCards = () => (
    <Grid container spacing={2}>
      {categories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((category) => (
        <Grid item xs={12} key={category.id}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                {category.cover ? (
                  <Avatar 
                    src={category.cover} 
                    alt={category.name}
                    variant="rounded"
                    sx={{ width: 60, height: 60, mr: 2 }}
                  />
                ) : (
                  <Avatar 
                    variant="rounded"
                    sx={{ width: 60, height: 60, mr: 2, bgcolor: 'grey.300' }}
                  >
                    <ImageIcon />
                  </Avatar>
                )}
                <Box>
                  <Typography variant="h6" component="div" noWrap sx={{ maxWidth: '70%' }}>
                    {category.name}
                  </Typography>
                  <Chip 
                    label={category.isActive ? 'Active' : 'Inactive'} 
                    color={category.isActive ? 'success' : 'default'}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
              
              {category.description && (
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {category.description}
                </Typography>
              )}
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Button 
                  startIcon={<EditIcon />} 
                  size="small" 
                  variant="outlined"
                  onClick={() => handleOpenEditDialog(category)}
                >
                  Edit
                </Button>
                <Button 
                  startIcon={category.isActive ? <VisibilityOffIcon /> : <VisibilityIcon />} 
                  size="small" 
                  variant="outlined"
                  color={category.isActive ? 'warning' : 'success'}
                  onClick={() => toggleCategoryActive(category)}
                >
                  {category.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button 
                  startIcon={<DeleteIcon />} 
                  size="small" 
                  variant="outlined" 
                  color="error"
                  onClick={() => handleOpenDeleteDialog(category)}
                >
                  Delete
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {!loading && categories.length === 0 && (
        <Grid item xs={12}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No categories found
            </Typography>
          </Paper>
        </Grid>
      )}

      {categories.length > 0 && (
        <Grid item xs={12}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={categories.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Grid>
      )}
    </Grid>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Category Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Add New
        </Button>
      </Box>

      {/* Display loading spinner when loading */}
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Display table for larger screens and cards for mobile */}
      {!loading && (
        isMobile
          ? renderCategoryCards()
          : renderCategoryTable()
      )}

      {/* Dialogs */}
      {renderCategoryDialog()}
      {renderDeleteDialog()}

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default HandleCat;