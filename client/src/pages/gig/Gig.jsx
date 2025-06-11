import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import Reviews from "../../components/reviews/Reviews";
import getCurrentUser from "../../utils/getCurrentUser";
import { Slider } from "infinite-react-carousel/lib";
import {
  Box,
  Typography,
  Button,
  Card,
  Grid,
  Avatar,
  Rating,
  Container,
  Paper,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  useTheme,
  useMediaQuery,
  styled,
  Divider,
  Breadcrumbs,
  Snackbar,
  Alert,
} from "@mui/material";
// import Discount from '@mui/icons-material/Info';
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningIcon from "@mui/icons-material/Warning";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Discount } from "@mui/icons-material";

// Custom styled components for the slider
const StyledSlider = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  "& img": {
    maxHeight: 500,
    objectFit: "cover",
    width: "100%",
    borderRadius: theme.shape.borderRadius,
  },
  "& .carousel-prev, & .carousel-next": {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: "50%",
    position: "absolute",
    top: 0,
    bottom: 0,
    margin: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 2,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      transform: "scale(1.05)",
    },
    "&:focus": {
      outline: "none",
    },
    "&::selection": {
      backgroundColor: "transparent",
    },
  },
}));

const StyledSellerBox = styled(Paper)(({ theme }) => ({
  backgroundColor: "#f8f9fa",
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  marginTop: theme.spacing(4),
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  border: "1px solid rgba(0, 0, 0, 0.05)",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
  },
}));

const StyledRightCard = styled(Card)(({ theme }) => ({
  background: "linear-gradient(145deg, #ffffff, #f8f9fa)",
  position: "sticky",
  top: 100,
  height: "max-content",
  maxHeight: 650,
  padding: theme.spacing(4),
  width: "100%",
  marginBottom: theme.spacing(2),
  borderRadius: 12,
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
  border: "1px solid rgba(0, 0, 0, 0.04)",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)",
  },
}));

const BookButton = styled(Button)(({ theme }) => ({
  background: "#164863", // Change to your desired color
  color: "white",
  padding: theme.spacing(1.5),
  marginTop: theme.spacing(3),
  fontSize: "1.1rem",
  fontWeight: 500,
  borderRadius: 8,
  boxShadow: "0 4px 15px rgba(86, 75, 80, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(82, 68, 74, 0.4)",
    background: "#0F3A4E",
  },
}));

const WishlistButton = styled(Button)(({ theme }) => ({
  border: "1px solid rgba(0, 0, 0, 0.1)",
  backgroundColor: "transparent",
  color: "black",
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.2),
  fontSize: "1rem",
  borderRadius: 8,
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    borderColor: "rgba(0, 0, 0, 0.2)",
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  position: "relative",
  paddingBottom: 8,
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 80,
    height: 3,
    backgroundColor: theme.palette.primary.main,
    borderRadius: 1.5,
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.01)",
    transform: "translateX(2px)",
  },
}));

const UserCard = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "rgba(0, 0, 0, 0.02)",
  marginBottom: theme.spacing(2),
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
}));

const DetailGrid = styled(Grid)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  "& .MuiGrid-item": {
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.03)",
    },
  },
}));

const Gig = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMedium = useMediaQuery(theme.breakpoints.down("md"));

  // Add state for notification
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (!id || id === "undefined") {
      navigate("/", { replace: true });
    }
  }, [id, navigate]);

  // Fetch gig data
  const { isLoading, error, data } = useQuery({
    queryKey: ["service", id],
    queryFn: () =>
      newRequest.get(`/services/single/${id}`).then((res) => res.data),
    enabled: !!id && id !== "undefined",
  });

  if (!id || id === "undefined") {
    return null;
  }

  // Fetch provider data using providerId from service
  const providerId = data?.providerId;
  const {
    isLoading: isLoadingProvider,
    error: providerError,
    data: providerData,
  } = useQuery({
    queryKey: ["provider", providerId],
    queryFn: () =>
      newRequest.get(`/users/provider/${providerId}`).then((res) => res.data),
    enabled: !!providerId,
  });

  // Extract userId from provider data to fetch user details
  const providerUserId = providerData?.userId;
  const {
    isLoading: isLoadingProviderUser,
    error: providerUserError,
    data: providerUserData,
  } = useQuery({
    queryKey: ["user", providerUserId],
    queryFn: () =>
      newRequest.get(`/users/${providerUserId}`).then((res) => res.data),
    enabled: !!providerUserId,
  });

  // Combine provider and user data for display
  const combinedProviderData = {
    ...providerData,
    ...(providerUserData && {
      // Add user-specific fields that should be included
      username: providerUserData.username,
      image: providerUserData.image || providerData?.image,
      phone: providerUserData.phone || providerData?.phone,
      email: providerUserData.email || providerData?.email,
      desc2: providerUserData.desc2 || providerData?.desc2,
      address: providerUserData.address || providerData.address,
      pincode: providerUserData.pincode || providerData.pincode,
      city: providerUserData.city || providerData.city,
      // Add any other fields from user that should be merged
    }),
  };

  // Fetch current user data
  const { isLoading: isLoadingCurrentUser, data: currentUserData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => {
      if (!currentUser) return Promise.resolve(null);
      return newRequest.get(`/users/${currentUser.id}`).then((res) => res.data);
    },
    enabled: !!currentUser,
  });

  // Check if service is in wishlist
  const { isLoading: isLoadingWishlistStatus, data: wishlistStatus } = useQuery(
    {
      queryKey: ["wishlistStatus", id],
      queryFn: () => {
        if (!currentUser) return Promise.resolve({ isWishlisted: false });
        return newRequest.get(`/wishlist/check/${id}`).then((res) => res.data);
      },
      enabled: !!currentUser && !!id,
    }
  );

  // Mutation to toggle wishlist
  const { mutate: toggleWishlist, isLoading: isTogglingWishlist } = useMutation(
    {
      mutationFn: () => newRequest.put(`/wishlist/${id}`),
      onSuccess: (response) => {
        // The backend returns updated wishlist
        const { message, wishlist } = response.data;

        // Update the UI with notification
        setNotification({
          open: true,
          message: message,
          severity: "success",
        });

        // Invalidate relevant queries to refresh the data
        queryClient.invalidateQueries(["wishlistStatus", id]);
        queryClient.invalidateQueries(["wishlist"]);
      },
      onError: (error) => {
        console.error("Wishlist error:", error);
        setNotification({
          open: true,
          message: "Failed to update wishlist. Please try again.",
          severity: "error",
        });
      },
    }
  );

  const handleToggleWishlist = () => {
    if (!currentUser) {
      setNotification({
        open: true,
        message: "Please login to add items to wishlist",
        severity: "warning",
      });
      return;
    }

    toggleWishlist();
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  // Calculate star rating properly
  const calculateRating = (totalStars, starNumber) => {
    if (!totalStars || !starNumber || starNumber === 0) return 0;
    return Math.round(totalStars / starNumber);
  };

  // Usage of the image slider in the component
  const renderImageSlider = () => (
    <StyledSlider>
      {data.images && Array.isArray(data.images) && data.images.length > 0 ? (
        <Slider slidesToShow={1} arrowsScroll={1} className="custom-slider">
          {data.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt="Gig Image"
              style={{
                maxHeight: 500,
                width: "100%",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          ))}
        </Slider>
      ) : (
        <Typography variant="body1">No images available</Typography>
      )}
    </StyledSlider>
  );

  const LoadingScreen = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "70vh",
      }}
    >
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" sx={{ mt: 3 }}>
        Loading service details...
      </Typography>
    </Box>
  );

  const ErrorScreen = () => (
    <Box
      sx={{
        textAlign: "center",
        py: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <WarningIcon sx={{ fontSize: 60, color: "warning.main" }} />
      <Typography variant="h5" gutterBottom>
        Something went wrong while loading this service.
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        The service you're looking for might not exist or there was an error
        loading it.
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate("/")}
        sx={{
          px: 4,
          py: 1,
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        Go Back to Home
      </Button>
    </Box>
  );

  // Check if we're still loading any provider-related data
  const isLoadingProviderDetails = isLoadingProvider || isLoadingProviderUser;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        fontFamily: '"Montserrat", sans-serif',
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <Container maxWidth="lg" sx={{ py: 5 }}>
        {isLoading || isLoadingCurrentUser || isLoadingProviderDetails ? (
          <LoadingScreen />
        ) : error || !data ? (
          <ErrorScreen />
        ) : (
          <Grid container spacing={isMobile ? 3 : 4}>
            {/* Left Side */}
            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: 2,
                  p: 3,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                {/* Breadcrumbs */}
                <Breadcrumbs
                  separator={<NavigateNextIcon fontSize="small" />}
                  aria-label="breadcrumb"
                  sx={{ mb: 2 }}
                >
                  <Link
                    to="/"
                    style={{
                      textDecoration: "none",
                      color: "rgba(0,0,0,0.6)",
                      fontSize: "0.9rem",
                    }}
                  >
                    ServiceHub
                  </Link>
                  <Link
                    to={`/gigs?cat=${data.cat}`}
                    style={{
                      textDecoration: "none",
                      color: "rgba(0,0,0,0.6)",
                      fontSize: "0.9rem",
                    }}
                  >
                    {data.cat}
                  </Link>
                  <Typography color="text.primary" sx={{ fontSize: "0.9rem" }}>
                    Service Details
                  </Typography>
                  <Button
                    component={Link}
                    to={`/gigs?providerId=${providerId}`}
                    variant="text"
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    View all services by{" "}
                    {combinedProviderData?.businessName ||
                      combinedProviderData?.username ||
                      "provider"}
                  </Button>
                </Breadcrumbs>

                {/* Title and Status */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      background:
                        "linear-gradient(90deg, #000000 0%, #333333 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      lineHeight: 1.2,
                    }}
                  >
                    {data.title}
                  </Typography>

                  {/* Unlisted Badge */}
                  {data.isUnlisted && (
                    <Chip
                      icon={<WarningIcon />}
                      label="This service is currently not available"
                      color="warning"
                      sx={{
                        mb: 2,
                        py: 0.5,
                        fontWeight: 500,
                        boxShadow: 1,
                      }}
                    />
                  )}
                </Box>

                {/* User info */}
                {isLoadingProvider ? (
                  <CircularProgress size={20} />
                ) : (
                  <UserCard>
                    <Avatar
                      src={combinedProviderData?.image || "/img/noavatar.jpg"}
                      alt={
                        combinedProviderData?.businessName ||
                        combinedProviderData?.username ||
                        "Provider"
                      }
                      sx={{
                        width: 48,
                        height: 48,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {combinedProviderData?.businessName ||
                          combinedProviderData?.username ||
                          "Provider"}
                      </Typography>

                      {data.totalStars && data.starNumber ? (
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                        >
                          <Rating
                            value={calculateRating(
                              data.totalStars,
                              data.starNumber
                            )}
                            readOnly
                            size="small"
                            precision={0.5}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: "bold",
                              color: "#f5a623",
                            }}
                          >
                            {calculateRating(data.totalStars, data.starNumber)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ({data.starNumber} reviews)
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No ratings yet
                        </Typography>
                      )}
                    </Box>
                  </UserCard>
                )}

                {/* Image Slider */}
                {renderImageSlider()}

                {/* About The Service */}
                {/* About The Service */}
                <Box sx={{ mt: 5 }}>
                  <SectionTitle variant="h5">About the service</SectionTitle>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "rgba(0,0,0,0.8)",
                      lineHeight: "1.8",
                      fontSize: "1.05rem",
                    }}
                  >
                    {data.desc}
                  </Typography>
                </Box>

                {/* About The Provider - Updated from Seller */}
                <Box sx={{ mt: 6 }}>
                  <SectionTitle variant="h5">About the provider</SectionTitle>

                  <Grid
                    container
                    spacing={3}
                    alignItems="center"
                    sx={{ mb: 3 }}
                  >
                    <Grid item>
                      <Avatar
                        src={combinedProviderData?.image || "/img/noavatar.jpg"}
                        alt={
                          combinedProviderData?.providerName ||
                          combinedProviderData?.username ||
                          "Provider"
                        }
                        sx={{
                          width: 120,
                          height: 120,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          border: "3px solid #fff",
                        }}
                      />
                    </Grid>
                    <Grid item xs>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 0.5,
                        }}
                      >
                        {combinedProviderData?.providerName ||
                          combinedProviderData?.username ||
                          "Provider"}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {combinedProviderData?.profession || "Not Provided"}
                      </Typography>

                      {data.totalStars && data.starNumber ? (
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                          sx={{ my: 1 }}
                        >
                          <Rating
                            value={calculateRating(
                              data.totalStars,
                              data.starNumber
                            )}
                            readOnly
                            size="small"
                          />
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold" }}
                          >
                            {calculateRating(data.totalStars, data.starNumber)}
                          </Typography>
                        </Stack>
                      ) : null}
                    </Grid>
                  </Grid>

                  <StyledSellerBox elevation={0}>
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 3,
                        fontStyle: "italic",
                        color: "rgba(0,0,0,0.7)",
                        borderLeft: "3px solid #7A2048",
                        pl: 2,
                        py: 1,
                      }}
                    >
                      {combinedProviderData?.desc ||
                        combinedProviderData?.desc2 ||
                        "Professional service provider ready to assist you with your needs."}
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: "#7A2048",
                      }}
                    >
                      Business Details
                    </Typography>

                    <DetailGrid container spacing={2}>
                      {[
                        {
                          title: "Business address",
                          desc:
                            combinedProviderData?.providerAddress &&
                            combinedProviderData?.pincode &&
                            combinedProviderData?.city
                              ? `${combinedProviderData.providerAddress}, ${combinedProviderData.pincode}, ${combinedProviderData.city}`
                              : "Not provided",
                          icon: "📍",
                        },
                        {
                          title: "Business email",
                          desc:
                            combinedProviderData?.providerEmail ||
                            "Not provided",
                          icon: "✉️",
                        },
                        {
                          title: "Contact number",
                          desc:
                            combinedProviderData?.providerPhone ||
                            "Not provided",
                          icon: "📞",
                        },
                        {
                          title: "Alternate contact",
                          desc:
                            combinedProviderData?.providerPhone ||
                            combinedProviderData?.phone ||
                            "Not provided",
                          icon: "📧",
                        },
                        {
                          title: "Business name",
                          desc:
                            combinedProviderData?.providerName ||
                            "Not provided",
                          icon: "🏢",
                        },
                        {
                          title: "Service level",
                          desc:
                            combinedProviderData?.serviceLevel || "Not Specified",
                          icon: "⭐",
                        },
                        {
                          title: "Experience",
                          desc:
                            combinedProviderData?.experience || "Not specified",
                          icon: "🧠",
                        },
                        {
                          title: "Profession",
                          desc:
                            combinedProviderData?.profession ||
                            "Not Specified",
                          icon: "👔",
                        },
                        {
                          title: "Service Hours",
                          desc:
                            combinedProviderData?.serviceHours ||
                            "Contact for availability",
                          icon: "🕓",
                        },
                      ].map((item, index) => (
                        <Grid item xs={12} sm={6} md={6} key={index}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "1.2rem" }}
                            >
                              {item.icon}
                            </Typography>
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: "0.85rem" }}
                              >
                                {item.title}
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 500,
                                  wordBreak: "break-word",
                                }}
                              >
                                {item.desc}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </DetailGrid>
                  </StyledSellerBox>
                </Box>

                {/* Reviews Section */}
                <Box sx={{ mt: 5 }}>
                  <SectionTitle variant="h5">Customer Reviews</SectionTitle>
                  <Reviews serviceId={id} />
                </Box>
              </Box>
            </Grid>

            {/* Right Side */}
            <Grid item xs={12} md={5}>
              <StyledRightCard elevation={3}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1.5,
                  }}
                >
                  <Chip
                    icon={<LocalOfferIcon fontSize="small" />}
                    label={data.cat}
                    variant="outlined"
                    sx={{
                      borderRadius: "16px",
                      fontWeight: 500,
                      px: 1,
                    }}
                  />
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "#7A2048",
                    }}
                  >
                    ₹ {data.price}
                  </Typography>
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: "#333",
                  }}
                >
                  {data.shortTitle}
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Typography
                  variant="body1"
                  sx={{
                    color: "black",
                    my: 1,
                    lineHeight: 1.8,
                  }}
                >
                  {data.shortDesc}
                </Typography>

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{
                    mb: 2,
                    p: 2,
                    backgroundColor: "rgba(0,0,0,0.02)",
                    borderRadius: 2,
                  }}
                >
                  <Discount sx={{ color: "#7A2048" }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {data.revisionNumber}
                  </Typography>
                </Stack>

                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 1.5,
                  }}
                >
                  Service features:
                </Typography>

                <List
                  disablePadding
                  sx={{
                    mb: 1,
                    backgroundColor: "rgba(0,0,0,0.01)",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  {data.features.map((feature) => (
                    <StyledListItem key={feature} disableGutters sx={{ py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleOutlineIcon
                          sx={{ color: "#7A2048" }}
                          fontSize="small"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{
                          variant: "body1",
                          fontWeight: 400,
                          color: "black",
                        }}
                      />
                    </StyledListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={2} sx={{ mt: 3 }}>
                  {currentUser && currentUser.id !== providerUserId && (
                    <WishlistButton
                      variant="outlined"
                      onClick={handleToggleWishlist}
                      fullWidth
                      disabled={isTogglingWishlist}
                      startIcon={
                        isTogglingWishlist ? (
                          <CircularProgress size={20} />
                        ) : wishlistStatus?.isWishlisted ? (
                          <FavoriteIcon color="error" />
                        ) : (
                          <FavoriteBorderIcon />
                        )
                      }
                    >
                      {isTogglingWishlist
                        ? "Updating..."
                        : wishlistStatus?.isWishlisted
                        ? "Remove from Wishlist"
                        : "Add to Wishlist"}
                    </WishlistButton>
                  )}
                  {currentUser &&
                    !data.isUnlisted &&
                    currentUser.id !== providerUserId && (
                      <BookButton
                        variant="contained"
                        component={Link}
                        to={`/confirmbooking/${id}`}
                        fullWidth
                      >
                        Book Now
                      </BookButton>
                    )}
                </Stack>
              </StyledRightCard>
            </Grid>
          </Grid>
        )}
        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Gig;
