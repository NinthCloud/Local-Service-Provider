import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  useMediaQuery,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Avatar,
  alpha
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Add as AddIcon,
  ArrowBackIos as PrevIcon,
  ArrowForwardIos as NextIcon
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import getCurrentUser from "../../utils/getCurrentUser";

const MyGigs = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 5;

  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const isMediumScreen = useMediaQuery("(max-width:960px)");
  
  // Separate useEffect for authentication check
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Get current user from localStorage or wherever it's stored
        const user = getCurrentUser();
        
        if (!user || !user.id) {
          navigate("/login");
          return;
        }
        
        // If needed, verify user status with an API call to get the latest data
        const userResponse = await newRequest.get(`/users/${user.id}`);
        const userData = userResponse.data;
        
        // Check if user meets all criteria
        if (!userData.isSeller || !userData.approvedByAdmin) {
          navigate("/login");
          return;
        }
        
        // Get provider information related to this user
        const providerResponse = await newRequest.get(`/users/provider/${userData.id}`);
        const providerData = providerResponse.data;
        
        if (!providerData || !providerData.id) {
          console.error("Provider data not found for user");
          navigate("/login");
          return;
        }
        
        // Save both user and provider data
        setCurrentUser({
          ...userData,
          providerId: providerData.id
        });
        
        setIsAuthorized(true);
      } catch (error) {
        console.error("Authentication error:", error);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const queryClient = useQueryClient();

  const { isLoading: isLoadingGigs, error, data } = useQuery({
    queryKey: ["myGigs", currentUser?.providerId, page],
    queryFn: () =>
      newRequest
        .get(`/services?providerId=${currentUser?.providerId}&page=${page}&limit=${limit}`)
        .then((res) => res.data),
    keepPreviousData: true,
    enabled: !!currentUser?.providerId && isAuthorized, // Only run query when provider ID is available
  });

  const mutation = useMutation({
    mutationFn: (id) => newRequest.patch(`/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => newRequest.patch(`/services/${id}/toggle-status`),
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
    },
  });

  const handleDelete = async (id) => {
    mutation.mutate(id);
  };

  const handleToggle = (id) => {
    toggleMutation.mutate(id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        bgcolor="#f8fafc"
      >
        <CircularProgress size={60} sx={{ color: "#495E57" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        bgcolor: "#f8fafc",
        minHeight: "100vh",
        p: { xs: 1, sm: 2, md: 3 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "1400px",
        }}
      >
        <Card 
          elevation={0}
          sx={{ 
            mb: 3,
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            background: "linear-gradient(145deg, #495E57, #588157)",
            color: "white"
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Box
              display="flex"
              flexDirection={isMediumScreen ? "column" : "row"}
              justifyContent="space-between"
              alignItems={isMediumScreen ? "flex-start" : "center"}
              gap={2}
            >
              <Box>
                <Typography
                  variant={isSmallScreen ? "h5" : "h4"}
                  fontWeight="700"
                  sx={{
                    mb: 1,
                    letterSpacing: 0.5,
                  }}
                >
                  My Services
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Manage your offerings and track performance
                </Typography>
              </Box>
              <Button
                variant="contained"
                component={Link}
                to="/add"
                startIcon={<AddIcon />}
                size={isSmallScreen ? "medium" : "large"}
                sx={{
                  bgcolor: "white",
                  color: "#495E57",
                  fontWeight: 600,
                  "&:hover": { 
                    bgcolor: alpha("#ffffff", 0.9),
                    transform: "translateY(-2px)",
                  },
                  px: 3,
                  py: isSmallScreen ? 1 : 1.5,
                  borderRadius: 2,
                  boxShadow: 2,
                  transition: "all 0.2s ease-in-out",
                }}
              >
                Add New Service
              </Button>
            </Box>
          </CardContent>
        </Card>

        {isLoadingGigs ? (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight="300px"
          >
            <CircularProgress size={60} sx={{ color: "#495E57" }} />
          </Box>
        ) : error ? (
          <Card sx={{ p: 4, borderRadius: 3, boxShadow: 2 }}>
            <Typography color="error" textAlign="center" variant="h6">
              Failed to load your services. Please try again later.
            </Typography>
          </Card>
        ) : (
          <Card 
            sx={{ 
              borderRadius: 3, 
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {isSmallScreen ? (
              // Mobile card view
              <Box>
                {Array.isArray(data?.services) && data.services.length > 0 ? (
                  data.services.map((service, index) => (
                    <Box key={service.id}>
                      <CardContent sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <Avatar
                              variant="rounded"
                              src={service.cover}
                              alt={service.title}
                              sx={{ 
                                width: "100%", 
                                height: 70, 
                                borderRadius: 2
                              }}
                            />
                          </Grid>
                          <Grid item xs={8}>
                            <Typography 
                              variant="subtitle1" 
                              fontWeight="600"
                              noWrap
                              sx={{ mb: 0.5 }}
                            >
                              {service.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Created: {formatDate(service.createdAt)}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Chip 
                                label={`₹${service.price}`} 
                                size="small" 
                                sx={{ 
                                  fontWeight: "bold",
                                  bgcolor: alpha("#495E57", 0.1),
                                  color: "#495E57"
                                }} 
                              />
                              <Chip 
                                label={`${service.sales} sales`} 
                                size="small" 
                                variant="outlined"
                              />
                            </Box>
                          </Grid>
                        </Grid>
                        
                        <Box display="flex" gap={1} mt={2}>
                          <Button
                            variant="outlined"
                            component={Link}
                            to={`/editGig/${service.id}`}
                            size="small"
                            startIcon={<EditIcon />}
                            sx={{ 
                              flex: 1,
                              borderRadius: 1.5,
                              borderColor: "#495E57",
                              color: "#495E57",
                              "&:hover": {
                                borderColor: "#495E57",
                                bgcolor: alpha("#495E57", 0.05)
                              }
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleToggle(service.id)}
                            sx={{
                              flex: 1,
                              borderRadius: 1.5,
                              bgcolor: service.isUnlisted ? "#4caf50" : "#f44336",
                              "&:hover": {
                                bgcolor: service.isUnlisted ? "#43a047" : "#e53935",
                              },
                            }}
                          >
                            {service.isUnlisted ? "List" : "Unlist"}
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleDelete(service.id)}
                            sx={{
                              flex: 1,
                              borderRadius: 1.5,
                              bgcolor: service.isDeleted ? "#4caf50" : "#f44336",
                              "&:hover": {
                                bgcolor: service.isDeleted ? "#43a047" : "#e53935",
                              },
                            }}
                          >
                            {service.isDeleted ? "Recover" : "Delete"}
                          </Button>
                        </Box>
                      </CardContent>
                      {index < data.services.length - 1 && <Divider />}
                    </Box>
                  ))
                ) : (
                  <CardContent sx={{ py: 5, textAlign: "center" }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No services found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create your first service to get started
                    </Typography>
                  </CardContent>
                )}
              </Box>
            ) : (
              // Desktop table view
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha("#495E57", 0.05) }}>
                      <TableCell sx={{ fontWeight: "bold" }}>Image</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Service</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Created</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Price</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Sales</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(data?.services) && data.services.length > 0 ? (
                      data.services.map((service) => (
                        <TableRow 
                          key={service.id}
                          hover
                          sx={{ 
                            "&:hover": { 
                              bgcolor: alpha("#495E57", 0.02),
                            },
                            transition: "background-color 0.2s"
                          }}
                        >
                          <TableCell>
                            <Avatar
                              variant="rounded"
                              src={service.cover}
                              alt={service.title}
                              sx={{ 
                                width: 80, 
                                height: 50, 
                                borderRadius: 2,
                                boxShadow: 1
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="subtitle2" 
                              fontWeight="medium"
                              sx={{ 
                                maxWidth: 300,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {service.title}
                            </Typography>
                          </TableCell>
                          <TableCell>{formatDate(service.createdAt)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={`₹${service.price}`} 
                              size="small" 
                              sx={{ 
                                fontWeight: "bold",
                                bgcolor: alpha("#495E57", 0.1),
                                color: "#495E57"
                              }} 
                            />
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight={service.sales > 0 ? "medium" : "normal"}>
                              {service.sales}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Tooltip title="Edit Service">
                                <IconButton
                                  component={Link}
                                  to={`/editGig/${service.id}`}
                                  size="small"
                                  sx={{ 
                                    color: "#495E57",
                                    bgcolor: alpha("#495E57", 0.1),
                                    "&:hover": {
                                      bgcolor: alpha("#495E57", 0.2),
                                    },
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleToggle(service.id)}
                                sx={{
                                  px: 2,
                                  borderRadius: 1.5,
                                  minWidth: 90,
                                  bgcolor: service.isUnlisted ? "#4caf50" : "#f44336",
                                  "&:hover": {
                                    bgcolor: service.isUnlisted ? "#43a047" : "#e53935",
                                    transform: "translateY(-1px)",
                                  },
                                  transition: "all 0.2s",
                                }}
                              >
                                {service.isUnlisted ? "List" : "Unlist"}
                              </Button>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleDelete(service.id)}
                                sx={{
                                  px: 2,
                                  borderRadius: 1.5,
                                  minWidth: 90,
                                  bgcolor: service.isDeleted ? "#4caf50" : "#f44336",
                                  "&:hover": {
                                    bgcolor: service.isDeleted ? "#43a047" : "#e53935",
                                    transform: "translateY(-1px)",
                                  },
                                  transition: "all 0.2s",
                                }}
                              >
                                {service.isDeleted ? "Recover" : "Delete"}
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No services found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Create your first service to get started
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Pagination */}
            {data?.totalPages > 1 && (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                p={3}
                gap={2}
                sx={{ borderTop: 1, borderColor: "divider" }}
              >
                <Button
                  variant="outlined"
                  startIcon={<PrevIcon />}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  sx={{
                    borderRadius: 2,
                    borderColor: "#495E57",
                    color: "#495E57",
                    "&:hover:not(:disabled)": {
                      borderColor: "#495E57",
                      bgcolor: alpha("#495E57", 0.05)
                    }
                  }}
                >
                  Previous
                </Button>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                    bgcolor: alpha("#495E57", 0.1),
                    minWidth: 100,
                  }}
                >
                  <Typography variant="body2" fontWeight="medium">
                    Page {data?.currentPage} of {data?.totalPages}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  endIcon={<NextIcon />}
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={page === data?.totalPages}
                  sx={{
                    borderRadius: 2,
                    borderColor: "#495E57",
                    color: "#495E57",
                    "&:hover:not(:disabled)": {
                      borderColor: "#495E57",
                      bgcolor: alpha("#495E57", 0.05)
                    }
                  }}
                >
                  Next
                </Button>
              </Box>
            )}
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default MyGigs;