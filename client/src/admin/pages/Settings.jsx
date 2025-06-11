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
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Chip,
  Skeleton,
  Divider,
  Stack,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import newRequest from "../../utils/newRequest";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [hoveredUser, setHoveredUser] = useState(null);

  const theme = useTheme();
  const isExtraSmall = useMediaQuery(theme.breakpoints.down("xs"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const isMedium = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    fetchUsers(page + 1, rowsPerPage);
  }, [page, rowsPerPage]);

  const fetchUsers = async (currentPage, limit) => {
    try {
      const response = await newRequest.get(
        `/admin/users?page=${currentPage}&limit=${limit}`,
        { withCredentials: true }
      );
      setUsers(response.data.users || []);
      setTotalUsers(response.data.totalUsers || 0);
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await newRequest.delete(`/admin/userDelete/${userId}`, { withCredentials: true });
      fetchUsers(page + 1, rowsPerPage);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handlePageChange = (_, newPage) => setPage(newPage);
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        px={2}
      >
        <CircularProgress size={isSmall ? 40 : 60} thickness={4} />
        <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
          Loading users...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        px={3}
      >
        <Card sx={{ maxWidth: 500, width: "100%", boxShadow: 3, borderRadius: 2 }}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography color="error" variant="h6" gutterBottom>
              {error}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => fetchUsers(page + 1, rowsPerPage)}
              sx={{ mt: 2 }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Card view for mobile devices
  if (isSmall) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
        <Typography 
          variant="h5" 
          fontWeight="bold" 
          sx={{ 
            mb: 3, 
            textAlign: "center",
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
            color: "white",
            py: 2,
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          All Users
        </Typography>

        <Stack spacing={2}>
          {users.length > 0 ? (
            users.map((user) => (
              <Card 
                key={user.id} 
                sx={{ 
                  borderRadius: 2, 
                  boxShadow: 2,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    boxShadow: 4,
                    transform: "translateY(-2px)"
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar 
                      src={user.image} 
                      alt={user.username} 
                      sx={{ 
                        width: 50, 
                        height: 50,
                        border: `2px solid ${theme.palette.primary.main}`
                      }} 
                    />
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="h6">{user.username}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                    <Chip 
                      icon={user.approvedByAdmin ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                      label={user.approvedByAdmin ? "Provider" : "Regular User"}
                      color={user.approvedByAdmin ? "primary" : "default"}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                    
                    <Box>
                      <Button
                        component={Link}
                        to={`/admin/providerdetails/${user.id}`}
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<InfoIcon />}
                        sx={{ mr: 1, borderRadius: 6 }}
                      >
                        Details
                      </Button>
                      <IconButton
                        onClick={() => deleteUser(user.id)}
                        color="error"
                        size="small"
                        sx={{ 
                          bgcolor: "error.light", 
                          color: "white",
                          "&:hover": { bgcolor: "error.main" } 
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card sx={{ borderRadius: 2, boxShadow: 2, p: 4, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                No users found.
              </Typography>
            </Card>
          )}
        </Stack>

        <Paper sx={{ mt: 2, borderRadius: 2, overflow: "hidden" }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalUsers}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Paper>
      </Box>
    );
  }

  // Table view for larger screens
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography 
        variant="h5" 
        fontWeight="bold" 
        sx={{ 
          mb: 3, 
          textAlign: "center",
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
          color: "white",
          py: 2,
          borderRadius: 2,
          boxShadow: 2
        }}
      >
        All Users
      </Typography>

      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 2, 
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
        }}
      >
        <TableContainer>
          <Table>
            <TableHead sx={{ 
              background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})` 
            }}>
              <TableRow>
                {!isMedium && <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>ID</TableCell>}
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>User</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Email</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Role</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow 
                    key={user.id} 
                    hover
                    sx={{ 
                      "&:hover": { 
                        backgroundColor: `${theme.palette.action.hover} !important`,
                      }
                    }}
                  >
                    {!isMedium && 
                      <TableCell sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                        {user.id}
                      </TableCell>
                    }
                    <TableCell sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar 
                        src={user.image} 
                        alt={user.username} 
                        sx={{ 
                          width: 40, 
                          height: 40,
                          border: `2px solid ${theme.palette.primary.light}`
                        }} 
                      />
                      <Typography fontWeight="medium">{user.username}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        icon={user.approvedByAdmin ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                        label={user.approvedByAdmin ? "Provider" : "Regular User"}
                        color={user.approvedByAdmin ? "primary" : "default"}
                        size="small"
                        variant={user.approvedByAdmin ? "filled" : "outlined"}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        component={Link}
                        to={`/admin/providerdetails/${user.id}`}
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<InfoIcon />}
                        sx={{ 
                          mr: 1,
                          borderRadius: 6,
                          textTransform: "none", 
                          boxShadow: 1
                        }}
                      >
                        Details
                      </Button>
                      <Tooltip title="Delete User">
                        <IconButton
                          onMouseEnter={() => setHoveredUser(user.id)}
                          onMouseLeave={() => setHoveredUser(null)}
                          onClick={() => deleteUser(user.id)}
                          color="error"
                          sx={{ 
                            transition: "all 0.2s",
                            "&:hover": { 
                              bgcolor: "error.light", 
                              color: "white" 
                            } 
                          }}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isMedium ? 4 : 5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No users found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
              [theme.breakpoints.down("sm")]: {
                display: "none"
              }
            }
          }}
        />
      </Paper>
    </Box>
  );
};

export default AllUsers;