import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import getCurrentUser from "../../utils/getCurrentUser";

// MUI Components
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Avatar,
  Box,
  IconButton,
  CircularProgress,
  Chip,
  Skeleton,
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  Star,
  StarBorder,
  Verified,
  LocationOn,
} from "@mui/icons-material";

const GigCard = ({ item }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const currentUser = getCurrentUser();
  const queryClient = useQueryClient();
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Fetch user/provider data
  const { isLoading, error, data } = useQuery({
    queryKey: ["user", item.providerId],
    queryFn: async () => {
      try {
        // First try to get provider details directly
        const providerResponse = await newRequest.get(`/users/provider/${item.providerId}`);
        const provider = providerResponse.data;
        
        // If we have provider data, get the associated user data
        if (provider && provider.userId) {
          const userResponse = await newRequest.get(`/users/${provider.userId}`);
          const userData = userResponse.data;
          
          // Combine the data
          return {
            ...userData,
            providerId: provider.id,
            providerName: provider.providerName,
            providerAddress: provider.providerAddress,
            providerEmail: provider.providerEmail,
            providerPhone: provider.providerPhone,
            verified: provider.verify,
            serviceLevel: provider.serviceLevel
          };
        }
        return null;
      } catch (error) {
        console.error("Error fetching user/provider data:", error);
        throw error;
      }
    },
    enabled: !!item.providerId, // Only run if we have a providerId
  });

  // Check wishlist status
  const { 
    data: wishlistData,
    isLoading: wishlistLoading 
  } = useQuery({
    queryKey: ["wishlist", "status", item.id],
    queryFn: () => 
      newRequest.get(`/wishlist/check/${item.id}`).then((res) => res.data),
    enabled: !!currentUser?.id,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Update local state when wishlist data changes
  useEffect(() => {
    if (wishlistData) {
      setIsWishlisted(wishlistData.isWishlisted);
    }
  }, [wishlistData]);

  // Mutation for toggling wishlist status (add/remove)
  const wishlistMutation = useMutation({
    mutationFn: () => newRequest.put(`/wishlist/${item.id}`),
    onSuccess: (response) => {
      // Toggle the wishlist status
      setIsWishlisted((prev) => !prev);
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries(["wishlist"]);
      queryClient.invalidateQueries(["wishlist", "status"]);
    },
    onError: (error) => {
      console.error("Error updating wishlist:", error.response?.data || error);
    },
  });

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only proceed if user is logged in
    if (!currentUser) {
      // Handle not logged in case - could redirect to login or show a message
      alert("Please log in to add items to your wishlist");
      return;
    }
    
    wishlistMutation.mutate();
  };

  // Calculate rating display
  const rating = !isNaN(item.totalStars / item.starNumber)
    ? Math.round((item.totalStars / item.starNumber) * 10) / 10
    : 0;

  // Generate star display
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} sx={{ color: "#FFB400", fontSize: isMobile ? 14 : 16 }} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} sx={{ color: "#FFB400", fontSize: isMobile ? 14 : 16, opacity: 0.6 }} />
        );
      } else {
        stars.push(<StarBorder key={i} sx={{ color: "#FFB400", fontSize: isMobile ? 14 : 16 }} />);
      }
    }

    return stars;
  };

  // Determine the heart icon state based on loading and wishlist status
  const renderHeartIcon = () => {
    if (wishlistMutation.isLoading) {
      return <CircularProgress size={20} />;
    }

    if (wishlistLoading) {
      return <CircularProgress size={20} />;
    }

    return isWishlisted ? 
      <Favorite sx={{ color: "#FF385C", fontSize: 22 }} /> : 
      <FavoriteBorder sx={{ color: "#fff", fontSize: 22 }} />;
  };

  return (
    <Link to={`/gig/${item.id}`} style={{ textDecoration: "none" }}>
      <Card
        sx={{
          width: "100%",
          minWidth: { xs: "240px", sm: "270px" },
          maxWidth: { xs: "100%", sm: "320px" },
          height: { xs: "auto", sm: "450px", md: "480px" },
          display: "flex",
          flexDirection: "column",
          borderRadius: "20px",
          backgroundColor: "#fff",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
          transition: "all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)",
          overflow: "hidden",
          opacity: item.isUnlisted ? 0.7 : 1,
          position: "relative",
          "&:hover": {
            transform: "translateY(-10px)",
            boxShadow: "0 15px 35px rgba(0, 0, 0, 0.12)",
          },
          "&:hover img": {
            transform: "scale(1.08)",
          },
        }}
      >
        {/* Wishlist Button - Floating */}
        <IconButton
          onClick={handleWishlist}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: isWishlisted ? "rgba(255, 255, 255, 0.95)" : "rgba(0, 0, 0, 0.35)",
            backdropFilter: "blur(4px)",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            padding: "8px",
            "&:hover": {
              backgroundColor: isWishlisted ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 0.5)",
              transform: "scale(1.1)",
            },
            zIndex: 1,
            transition: "all 0.2s ease",
          }}
        >
          {renderHeartIcon()}
        </IconButton>

        {/* Not Available Badge */}
        {item.isUnlisted && (
          <Chip
            label="Not Available"
            color="error"
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              fontWeight: "600",
              fontSize: "11px",
              zIndex: 1,
              boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
              backdropFilter: "blur(2px)",
              px: 1,
            }}
          />
        )}

        {/* Gig Cover Image Container - Fixed Height */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "200px", // Fixed exact height for all images
            overflow: "hidden",
          }}
        >
          <CardMedia
            component="img"
            image={item.cover || "/img/placeholder.jpg"}
            alt={item.title}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              transition: "transform 0.7s cubic-bezier(0.25, 0.8, 0.25, 1)",
              ...(item.isUnlisted && {
                filter: "grayscale(60%) brightness(0.85)",
              }),
            }}
          />
        </Box>

        <CardContent
          sx={{
            padding: { xs: "14px", sm: "18px", md: "20px" },
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Top Content Section */}
          <Box>
            {/* User Info */}
            {isLoading ? (
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <Skeleton variant="circular" width={36} height={36} />
                <Box>
                  <Skeleton variant="text" width={120} height={16} />
                  <Skeleton variant="text" width={80} height={14} />
                </Box>
              </Box>
            ) : error ? (
              <Typography color="error" variant="caption">Error loading seller</Typography>
            ) : data ? (
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <Avatar
                  src={data.image || "/img/noavatar.jpg"}
                  sx={{
                    width: 36,
                    height: 36,
                    border: "2px solid #f0f0f0",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
                  }}
                />
                <Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="600"
                      fontSize={{ xs: "13px", sm: "14px" }}
                      sx={{
                        maxWidth: "180px",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {data.providerName || data.username}
                    </Typography>
                    {data.verified && (
                      <Tooltip title="Verified Provider">
                        <Verified sx={{ color: "#4285F4", fontSize: 15 }} />
                      </Tooltip>
                    )}
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontSize={{ xs: "10px", sm: "11px" }}
                    sx={{
                      maxWidth: { xs: "160px", sm: "220px" },
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {data.serviceLevel || ""}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography variant="caption">Seller data unavailable</Typography>
            )}

            {/* Title */}
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: "14px", sm: "16px", md: "17px" },
                fontWeight: 700,
                lineHeight: 1.3,
                color: item.isUnlisted ? "text.disabled" : "text.primary",
                mb: 1.2,
                display: "-webkit-box",
                overflow: "hidden",
                textOverflow: "ellipsis",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                minHeight: { xs: "38px", sm: "42px" },
                maxHeight: { xs: "38px", sm: "42px" },
              }}
            >
              {item.title}
            </Typography>

            {/* Description - with fixed height and truncation */}
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: "11px", sm: "12px", md: "13px" },
                fontWeight: 400,
                lineHeight: 1.5,
                color: "text.secondary",
                mb: 1.5,
                display: "-webkit-box",
                overflow: "hidden",
                textOverflow: "ellipsis",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                height: { xs: "32px", sm: "36px" },
              }}
            >
              {item.desc}
            </Typography>

            {/* Rating */}
            <Box display="flex" alignItems="center" gap={0.5} mb={2}>
              {renderStars()}
              <Typography
                variant="body2"
                fontWeight="500"
                color="text.secondary"
                ml={0.5}
                fontSize={{ xs: "11px", sm: "12px" }}
              >
                ({rating} • {item.starNumber || 0})
              </Typography>
            </Box>
          </Box>

          {/* Bottom Section with Price */}
          <Box>
            <Divider 
              sx={{ 
                mb: 1.5,
                "&::before, &::after": {
                  borderColor: "rgba(0, 0, 0, 0.08)",
                }
              }} 
            />

            {/* Price */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontSize={{ xs: "11px", sm: "12px" }}
                fontWeight={500}
              >
                Priced at
              </Typography>
              <Typography
                variant="h6"
                color={item.isUnlisted ? "text.disabled" : "primary.main"}
                fontSize={{ xs: "18px", sm: "20px", md: "22px" }}
                fontWeight={700}
                sx={{
                  textShadow: item.isUnlisted ? "none" : "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                ₹{item.price}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
};

export default GigCard;