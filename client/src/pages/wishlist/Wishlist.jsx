import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  CircularProgress,
  Stack,
  Rating,
  useMediaQuery,
  Chip,
  Paper,
  Pagination,
  Container,
  Divider,
  Avatar,
  Button
} from "@mui/material";
import { 
  Delete as DeleteIcon,
  Favorite as FavoriteIcon} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import getCurrentUser from "../../utils/getCurrentUser";

const Wishlist = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [page, setPage] = useState(1);
  const limit = 6;

  // Responsive breakpoints
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const isMediumScreen = useMediaQuery("(max-width:960px)");

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const { isLoading, error, data } = useQuery({
    queryKey: ["wishlist", currentUser?.id, page],
    queryFn: () =>
      newRequest
        .get(`/wishlist?page=${page}&limit=${limit}`, {
          withCredentials: true,
        })
        .then((res) => res.data),
    enabled: !!currentUser,
    onError: (err) => console.error("Error fetching wishlist:", err),
  });

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    // Changed from put to delete to match the router
    mutationFn: (id) => newRequest.delete(`/wishlist/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["wishlist", currentUser?.id]);
      queryClient.invalidateQueries(["services"]);
    },
    onError: (err) => console.error("Error updating wishlist:", err),
  });

  const handleRemoveFromWishlist = (id) => {
    mutate(id);
  };

  const calculateRating = (totalStars, starNumber) => {
    if (!totalStars || !starNumber || starNumber === 0) return 0;
    return Math.round(totalStars / starNumber);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
        minHeight: "calc(100vh - 64px)", // Adjust based on your header height
        py: 4,
        px: isSmallScreen ? 1 : 3,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              p: 3,
              backgroundColor: "primary.main",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <Box display="flex" alignItems="center">
              <FavoriteIcon sx={{ mr: 1.5 }} />
              <Typography
                variant={isSmallScreen ? "h5" : "h4"}
                fontWeight="bold"
              >
                My Wishlist
              </Typography>
            </Box>
            <Chip 
              // Changed from totalGigs to totalServices to match backend
              label={data?.totalServices || 0} 
              color="secondary" 
              sx={{ fontWeight: "bold" }} 
            />
          </Box>

          <Box p={isSmallScreen ? 2 : 3}>
            {isLoading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress size={60} thickness={4} />
              </Box>
            ) : error ? (
              <Box textAlign="center" py={6}>
                <Typography color="error" variant="h6" gutterBottom>
                  Failed to fetch wishlist
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => queryClient.invalidateQueries(["wishlist", currentUser?.id])}
                  sx={{ mt: 2 }}
                >
                  Try Again
                </Button>
              </Box>
            // Changed from gigs to services to match backend
            ) : data?.services?.length > 0 ? (
              <Grid container spacing={isSmallScreen ? 2 : 3} sx={{ mt: 0.5 }}>
                {data.services.map((service) => (
                  <Grid item xs={12} sm={6} md={4} key={service.id}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                        transition: "all 0.3s ease",
                        "&:hover": { 
                          transform: "translateY(-6px)",
                          boxShadow: "0 12px 20px rgba(0,0,0,0.12)",
                        },
                        position: "relative",
                      }}
                      component={Link}
                      // Changed from gig to service
                      to={`/gig/${service.id}`}
                    >
                      <Box sx={{ position: "relative" }}>
                        <CardMedia
                          component="img"
                          image={service.cover}
                          alt={service.title}
                          sx={{
                            height: 200,
                            objectFit: "cover",
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemoveFromWishlist(service.id);
                          }}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 1)",
                            },
                            color: "error.main",
                            zIndex: 1,
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                            p: 1.5,
                            zIndex: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            color="white"
                            noWrap
                          >
                            {service.title}
                          </Typography>
                        </Box>
                      </Box>
                      <CardContent sx={{ p: 2, flexGrow: 1 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Avatar 
                            // Changed from userId to seller to match backend structure
                            src={service.provider?.user?.image} 
                            sx={{ width: 24, height: 24, mr: 1 }}
                          >
                             {service.provider?.user?.username?.charAt(0) || "U"}
                          </Avatar>
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            color="text.secondary"
                          >
                            {service.provider?.user?.username || "Unknown"}
                          </Typography>
                        </Box>
                        
                        <Stack 
                          direction="row" 
                          alignItems="center" 
                          spacing={0.5} 
                          sx={{ mb: 1.5 }}
                        >
                          <Rating
                            value={calculateRating(service.totalStars, service.starNumber)}
                            readOnly
                            size="small"
                            precision={0.5}
                          />
                          <Typography variant="body2" color="text.secondary">
                            ({service.starNumber || 0})
                          </Typography>
                        </Stack>

                        <Divider sx={{ my: 1.5 }} />
                        
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mt={1}
                        >
                          <Typography 
                            variant="h6" 
                            fontWeight="bold" 
                            color="primary"
                          >
                            ₹{service.price}
                          </Typography>
                          
                          <Chip 
                            size="small" 
                            label="View Details"
                            color="secondary"
                            variant="outlined"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box textAlign="center" py={6}>
                <FavoriteIcon 
                  sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} 
                />
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  gutterBottom
                >
                  Your wishlist is empty
                </Typography>
                <Typography 
                  variant="body2"
                  color="text.secondary" 
                  paragraph
                  sx={{ maxWidth: 450, mx: "auto", mb: 3 }}
                >
                  Browse and add some to your wishlist to keep track of services you're interested in.
                </Typography>
                <Button 
                  variant="contained" 
                  // Changed from gigs to services
                  onClick={() => navigate("/gigs?cat")}
                >
                  Explore Services
                </Button>
              </Box>
            )}

            {/* Pagination */}
            {data?.totalPages > 1 && (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                mt={4}
              >
                <Pagination
                  count={data.totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                  variant="outlined"
                  shape="rounded"
                  size={isSmallScreen ? "small" : "medium"}
                />
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Wishlist;