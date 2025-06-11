import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
  TablePagination,
  Button,
  TextField,
  IconButton,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  Tooltip,
  useTheme,
  useMediaQuery,
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import InfoIcon from "@mui/icons-material/Info";
import RestoreIcon from "@mui/icons-material/Restore";
import newRequest from "../../utils/newRequest";

const GigsList = () => {
  const [services, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalServices, setTotalGigs] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchGigs(page + 1, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, searchQuery]);

  const fetchGigs = async (currentPage, limit, search) => {
    setLoading(true);
    try {
      const response = await newRequest.get(
        `/admin/services?page=${currentPage}&limit=${limit}&search=${search}`
      );
      setGigs(response.data.services || []);
      setTotalGigs(response.data.totalServices || 0);
    } catch (err) {
      console.error("Error fetching gigs:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteGig = async (id) => {
    try {
      await newRequest.patch(
        `/admin/delete/${id}`,
        {},
        { withCredentials: true }
      );
      setGigs(
        services.map((service) =>
          service.id === id ? { ...service, isDeleted: !service.isDeleted } : service
        )
      );
    } catch (error) {
      console.error("Error deleting gig:", error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  // Mobile card view for each gig
  const GigCard = ({ service }) => (
    <Card 
      sx={{ 
        mb: 2, 
        borderLeft: 6, 
        borderColor: service.isDeleted ? 'error.light' : 'primary.light',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {truncateText(service.title, 30)}
          </Typography>
          <Chip 
            label={`₹${service.price}`} 
            color="primary" 
            variant="outlined" 
            size="small" 
            sx={{ color: "white", borderColor: "white" }} 
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {truncateText(service.desc, 80)}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              ID: {truncateText(service.id, 8)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Provider: {truncateText(service.userId, 8)}
            </Typography>
          </Box>

          <Box>
            <Button
              component={Link}
              to={`/admin/servicedetails/${service.id}`}
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<InfoIcon />}
              sx={{ mr: 1 }}
            >
              Details
            </Button>
            <Tooltip title={service.isDeleted ? "Restore" : "Delete"}>
              <IconButton
                onClick={() => deleteGig(service.id)}
                color={service.isDeleted ? "success" : "error"}
                size="small"
              >
                {service.isDeleted ? <RestoreIcon /> : <DeleteIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ padding: { xs: 2, sm: 3 }, maxWidth: '1200px', mx: 'auto' }}>
      <Card 
        elevation={3} 
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden',
          background: theme => `linear-gradient(to right, ${theme.palette.primary.dark}10, ${theme.palette.primary.light}05)`,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold',
                backgroundImage: 'linear-gradient(45deg, #2196F3, #3f51b5)',
                backgroundClip: 'text',
                color: 'transparent',
                WebkitBackgroundClip: 'text'
              }}
            >
              Manage Services
            </Typography>
            <Chip 
              label={`Total: ${totalServices}`} 
              color="primary" 
              size="small" 
              sx={{ fontWeight: 'medium' }}
            />
          </Box>

          {/* Search Bar */}
          <TextField
            placeholder="Search by name, description, price..."
            variant="outlined"
            fullWidth
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress size={40} thickness={4} />
            </Box>
          )}

          {/* Mobile/Tablet View */}
          {!loading && isMobile && (
            <>
              {services.length > 0 ? (
                services.map((service) => (
                  <GigCard key={service.id} service={service} />
                ))
              ) : (
                <Card sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.100' }}>
                  <Typography variant="body1" color="text.secondary">
                    No services found.
                  </Typography>
                </Card>
              )}
            </>
          )}

          {/* Desktop Table View */}
          {!loading && !isMobile && (
            <TableContainer 
              component={Paper} 
              elevation={0}
              sx={{ 
                mb: 2, 
                borderRadius: 1,
                maxHeight: isTablet ? '400px' : '600px',
                overflow: 'auto'
              }}
            >
              <Table stickyHeader size={isTablet ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>Provider ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>Name</TableCell>
                    {!isTablet && (
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>Description</TableCell>
                    )}
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.length > 0 ? (
                    services.map((service) => (
                      <TableRow 
                        key={service.id}
                        sx={{ 
                          '&:hover': { backgroundColor: 'action.hover' },
                          opacity: service.isDeleted ? 0.7 : 1
                        }}
                      >
                        <TableCell sx={{ maxWidth: '100px' }}>
                          <Tooltip title={service.id}>
                            <Typography variant="body2">
                              {truncateText(service.id, 10)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ maxWidth: '100px' }}>
                          <Tooltip title={service.userId}>
                            <Typography variant="body2">
                              {truncateText(service.userId, 10)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ maxWidth: '200px' }}>
                          <Tooltip title={service.title}>
                            <Typography variant="body2">
                              {truncateText(service.title, 25)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        {!isTablet && (
                          <TableCell sx={{ maxWidth: '250px' }}>
                            <Tooltip title={service.desc}>
                              <Typography variant="body2">
                                {truncateText(service.desc, 40)}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                        )}
                        <TableCell>
                          <Chip 
                            label={`₹${service.price}`} 
                            size="small" 
                            variant="outlined" 
                            color="primary"
                            sx={{ color: "white", borderColor: "white" }}  
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              component={Link}
                              to={`/admin/servicedetails/${service.id}`}
                              variant="outlined"
                              color="primary"
                              size="small"
                              startIcon={<InfoIcon />}
                            >
                              {isTablet ? '' : 'Details'}
                            </Button>
                            <Tooltip title={service.isDeleted ? "Restore" : "Delete"}>
                              <IconButton
                                onClick={() => deleteGig(service.id)}
                                color={service.isDeleted ? "success" : "error"}
                                size="small"
                              >
                                {service.isDeleted ? <RestoreIcon /> : <DeleteIcon />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={isTablet ? 5 : 6} align="center">
                        <Typography sx={{ py: 2 }}>No services found.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {!loading && services.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <TablePagination
                component="div"
                count={totalServices}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
                sx={{
                  '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                    margin: 0,
                  },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default GigsList;