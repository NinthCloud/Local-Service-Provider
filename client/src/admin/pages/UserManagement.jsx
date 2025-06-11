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
  IconButton,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Tooltip
} from "@mui/material";
import newRequest from "../../utils/newRequest";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const RegularUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchRegularUsers(page + 1, rowsPerPage);
  }, [page, rowsPerPage]);

  const fetchRegularUsers = async (currentPage, limit) => {
    try {
      const response = await newRequest.get(
        `/admin/regular-users?page=${currentPage}&limit=${limit}`,
        {
          withCredentials: true,
        }
      );

      console.log("Regular Users:", response.data);

      setUsers(response.data.users || []);
      setTotalUsers(response.data.totalUsers || 0);
    } catch (error) {
      console.error("Error fetching regular users:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await newRequest.delete(
        `/admin/userDelete/${userId}`,
        {},
        { withCredentials: true }
      );
      fetchRegularUsers(page + 1, rowsPerPage);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Card view for mobile devices
  if (isMobile) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 3 }}>
          Regular Users
        </Typography>
        
        {users.length > 0 ? (
          users.map((user) => (
            <Card 
              key={user.id} 
              sx={{ 
                mb: 2, 
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>{user.username}</Typography>
                  <Chip 
                    icon={<PersonIcon fontSize="small" />} 
                    label="User" 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={1}>
                  <Grid item xs={12} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <EmailIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    <Typography variant="body2">{user.email}</Typography>
                  </Grid>
                  <Grid item xs={12} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <PhoneIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    <Typography variant="body2">{user.phone || "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={12} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <LocationOnIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    <Typography variant="body2">{user.address || "N/A"}</Typography>
                  </Grid>
                </Grid>
                
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                  <Button
                    component={Link}
                    to={`/admin/providerdetails/${user.id}`}
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<InfoIcon />}
                    sx={{ mr: 1, borderRadius: 8 }}
                  >
                    Details
                  </Button>
                  <Tooltip title="Delete User">
                    <IconButton
                      onClick={() => deleteUser(user.id)}
                      color="warning"
                      size="small"
                      sx={{ 
                        backgroundColor: "rgba(211, 47, 47, 0.1)",
                        "&:hover": {
                          backgroundColor: "rgba(211, 47, 47, 0.2)",
                        }
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No regular users found.
            </Typography>
          </Box>
        )}
        
        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>
    );
  }

  // Simplified table for tablets
  if (isTablet) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 3 }}>
          Regular Users
        </Typography>
        
        <TableContainer 
          component={Paper}
          sx={{ 
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.07)",
            overflow: "hidden"
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "black" }}>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow 
                    key={user.id}
                    sx={{ 
                      "&:hover": { 
                        backgroundColor: theme.palette.action.hover 
                      }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {user.username}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Button
                        component={Link}
                        to={`/admin/providerdetails/${user.id}`}
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<InfoIcon />}
                        sx={{ mr: 1, borderRadius: 8 }}
                      >
                        Details
                      </Button>
                      <IconButton
                        onClick={() => deleteUser(user.id)}
                        color="warning"
                        size="small"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No regular users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>
    );
  }

  // Desktop view with enhanced styling
  return (
    <Box sx={{ p: 3 }}>
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          fontWeight: 600, 
          color: theme.palette.primary.main,
          mb: 3
        }}
      >
        Regular Users
        <Typography 
          component="span" 
          sx={{ 
            ml: 1,
            color: theme.palette.text.secondary,
            fontSize: "1rem",
            fontWeight: 400
          }}
        >
          ({totalUsers} total)
        </Typography>
      </Typography>
      
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.07)",
          overflow: "hidden"
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "black" }}>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow 
                  key={user.id}
                  sx={{ 
                    "&:hover": { 
                      backgroundColor: theme.palette.action.hover 
                    }
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                      {user.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {user.username}
                    </Typography>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || "N/A"}</TableCell>
                  <TableCell>{user.address || "N/A"}</TableCell>
                  <TableCell align="center">
                    <Button
                      component={Link}
                      to={`/admin/providerdetails/${user.id}`}
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<InfoIcon />}
                      sx={{ 
                        mr: 1, 
                        borderRadius: 8,
                        textTransform: "none"
                      }}
                    >
                      View Details
                    </Button>
                    <Tooltip title="Delete User">
                      <IconButton
                        onClick={() => deleteUser(user.id)}
                        color="warning"
                        size="small"
                        sx={{ 
                          backgroundColor: "rgba(211, 47, 47, 0.1)",
                          "&:hover": {
                            backgroundColor: "rgba(211, 47, 47, 0.2)",
                          }
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No regular users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>
    </Box>
  );
};

export default RegularUsers;