import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper, 
  Avatar, 
  Grid, 
  Chip, 
  Divider,
  useTheme,
  useMediaQuery
} from "@mui/material";
import newRequest from "../../utils/newRequest";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import NoteIcon from "@mui/icons-material/Note";
import PaidIcon from "@mui/icons-material/Paid";

const OrderDetails = () => {
  const { bookingId } = useParams();
  const [booking, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await newRequest.get(`/admin/booking/${bookingId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setOrder(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [bookingId]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "in progress":
        return "info";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <CircularProgress />
    </Box>
  );
  
  if (error) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <Typography color="error" variant="h6">{error}</Typography>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 4, p: { xs: 2, md: 3 } }}>
      <Paper elevation={3} sx={{ 
        borderRadius: 3, 
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)" 
      }}>
        {/* Header */}
        <Box sx={{ 
          p: { xs: 2, md: 3 }, 
          background: "linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)",
          color: "white"
        }}>
          <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" sx={{ mb: 1 }}>
            Booking Details
          </Typography>
          <Chip 
            label={booking.status} 
            color={getStatusColor(booking.status)} 
            sx={{ fontWeight: "bold", px: 1 }}
          />
        </Box>

        {/* Main Content */}
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {/* Order Summary */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar 
                    src={booking.img} 
                    alt="Service" 
                    sx={{ 
                      width: { xs: 56, md: 70 }, 
                      height: { xs: 56, md: 70 },
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }} 
                  />
                  <Typography variant="h6" fontWeight="500">
                    {booking.title}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: { xs: "flex-start", sm: "flex-end" },
                  mt: { xs: 1, sm: 0 }
                }}>
                  <PaidIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    ₹{booking.price}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              {/* Scheduling Info */}
              <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: "rgba(0,0,0,0.02)" }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                  Schedule Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center">
                      <CalendarTodayIcon sx={{ mr: 1, color: "primary.main" }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Preferred Date
                        </Typography>
                        <Typography fontWeight="medium">
                          {booking.preferredDate || "Not specified"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center">
                      <AccessTimeIcon sx={{ mr: 1, color: "primary.main" }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Preferred Time
                        </Typography>
                        <Typography fontWeight="medium">
                          {booking.preferredTime || "Not specified"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Buyer Details */}
              <Paper elevation={1} sx={{ p: 2, mb: { xs: 3, md: 0 }, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                  Buyer Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography fontWeight="medium">{booking?.buyerDetails?.fullName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Username</Typography>
                    <Typography fontWeight="medium">{booking?.buyerDetails?.username}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography fontWeight="medium">{booking?.buyerDetails?.email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Address</Typography>
                    <Typography fontWeight="medium">{booking?.buyerDetails?.address || "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography fontWeight="medium">{booking?.buyerDetails?.phone || "N/A"}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={6}>
              {/* Notes */}
              <Paper elevation={1} sx={{ p: 2, mb: 3, mt: 3.5, borderRadius: 2, bgcolor: "rgba(0,0,0,0.02)" }}>
                <Box display="flex" alignItems="flex-start">
                  <NoteIcon sx={{ mr: 1, mt: 0.5, color: "primary.main" }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Notes
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                      {booking.notes || "No notes provided"}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Provider Details */}
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                  Provider Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography fontWeight="medium">{booking.sellerDetails.fullName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Username</Typography>
                    <Typography fontWeight="medium">{booking.sellerDetails.username}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Business Email</Typography>
                    <Typography fontWeight="medium">
                      {booking.providerDetails?.providerEmail || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Business Phone</Typography>
                    <Typography fontWeight="medium">
                      {booking.providerDetails?.providerPhone || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Business Name</Typography>
                    <Typography fontWeight="medium">
                      {booking.providerDetails?.providerName || "N/A"}
                    </Typography>
                  </Grid>
                </Grid>

                {booking.providerDetails && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Profession</Typography>
                        <Typography fontWeight="medium">
                          {booking.providerDetails?.profession || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Experience</Typography>
                        <Typography fontWeight="medium">
                          {booking.providerDetails.experience} years
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Service Level</Typography>
                        <Chip 
                          label={booking.providerDetails.serviceLevel} 
                          color="primary" 
                          variant="outlined" 
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Grid>
                    </Grid>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default OrderDetails;