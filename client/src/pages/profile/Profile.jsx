import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  Paper,
  Avatar,
  Chip,
  Divider,
  Button,
  Card,
  CardContent,
  useMediaQuery,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import VerifiedIcon from "@mui/icons-material/Verified";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import getCurrentUser from "../../utils/getCurrentUser";

const ProfileView = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await newRequest.get(`/users/${currentUser.id}`);
        setUserData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load profile data. Please try again.");
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleEditProfile = () => {
    navigate("/editprofile");
  };

  const handlePassword = () => {
    navigate("/changepassword");
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ my: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!userData) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          transition: "all 0.3s ease",
        }}
      >
        {/* Header/Cover Section */}
        <Box
          sx={{
            height: isMobile ? "120px" : "180px",
            bgcolor: "#E3F2FD",
            position: "relative",
          }}
        >
          <Button
            variant="contained"
            color="secondary"
            startIcon={<EditIcon />}
            onClick={handleEditProfile}
            sx={{
              position: "absolute",
              top: isMobile ? 12 : 20,
              right: isMobile ? 12 : 20,
              zIndex: 2,
            }}
          >
            Edit Profile
          </Button>
        </Box>

        {/* Profile Picture & Basic Info */}
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "center" : "flex-start",
            px: { xs: 2, sm: 3, md: 4 },
            transform: "translateY(-60px)",
            mb: "-70px",
          }}
        >
          <Avatar
            src={userData.image || "/assets/default-avatar.png"}
            alt={userData.username}
            sx={{
              width: { xs: 100, sm: 120, md: 140 },
              height: { xs: 100, sm: 120, md: 140 },
              border: "4px solid white",
              boxShadow: theme.shadows[4],
              mb: isMobile ? 2 : 0,
            }}
          />
          <Box
            sx={{
              ml: isMobile ? 0 : 2,
              textAlign: isMobile ? "center" : "left",
              mt: -1, // Moves both typography elements slightly up
            }}
          >
            <Typography variant="h4" fontWeight="bold">
              {userData.fullName || userData.username}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              @{userData.username}
            </Typography>
            {userData.isSeller && userData.approvedByAdmin &&(
              <Chip
                icon={<VerifiedIcon />}
                label="Service Provider"
                color="primary"
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </Box>

        {/* Main Content */}
        <Grid container spacing={3} sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
          {/* Left column - Personal Info */}
          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <AccountBoxIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Personal Information</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <InfoItem
                  icon={<EmailIcon />}
                  label="Email"
                  value={userData.email}
                />
                <InfoItem
                  icon={<PhoneIcon />}
                  label="Phone"
                  value={userData.phone || "Not provided"}
                />
                <InfoItem
                  icon={<CalendarTodayIcon />}
                  label="Date of Birth"
                  value={formatDate(userData.dob)}
                />
                <InfoItem
                  icon={<LocationOnIcon />}
                  label="Address"
                  value={
                    userData.address
                      ? `${userData.address}, ${userData.city || ""} ${
                          userData.pincode || ""
                        }`
                      : "Not provided"
                  }
                />
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  About Me
                </Typography>
                <Typography variant="body1">
                  {userData.desc2 || "No description provided."}
                </Typography>
              </CardContent>
            </Card>
            <Button
            variant="contained"
            color="secondary"
            startIcon={<EditIcon />}
            onClick={handlePassword}
            sx={{
              position: "relative",
              top: isMobile ? 12 : 20,
              right: isMobile ? 12 : 1,
              zIndex: 2,
            }}
          >
            Change password
          </Button>
          </Grid>

          {/* Right column - Provider Info (if applicable) */}
          <Grid item xs={12} md={6}>
            {userData.isSeller && userData.approvedByAdmin ?(
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <WorkIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Provider Information</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  <InfoItem
                    label="Business Name"
                    value={userData.providerName || "Not provided"}
                  />
                  <InfoItem
                    label="Business Email"
                    value={userData.providerEmail || "Not provided"}
                  />
                  <InfoItem
                    label="Business Phone"
                    value={userData.providerPhone || "Not provided"}
                  />
                  <InfoItem
                    label="Business Address"
                    value={userData.providerAddress || "Not provided"}
                  />
                  <InfoItem
                    label="Service Level"
                    value={userData.serviceLevel || "Not specified"}
                  />
                  <InfoItem
                    label="Service Hours"
                    value={userData.serviceHours || "Not specified"}
                  />
                  <InfoItem
                    label="Profession"
                    value={userData.profession || "Not specified"}
                  />
                  <InfoItem
                    label="Experience"
                    value={userData.experience || "Not specified"}
                  />

                  <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                    About My Services
                  </Typography>
                  <Typography variant="body1">
                    {userData.desc || "No service description provided."}
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Card sx={{ borderRadius: 2, height: "100%" }}>
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    py: 6,
                  }}
                >
                  <WorkIcon
                    sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" align="center">
                    Not a Service Provider
                  </Typography>
                  <Typography
                    variant="body1"
                    align="center"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    You haven't registered as a service provider yet.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleEditProfile}
                  >
                    Become a Provider
                  </Button>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

// Helper component for displaying info items
const InfoItem = ({ icon, label, value }) => (
  <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
    {icon && <Box sx={{ mr: 2, color: "text.secondary", mt: 0.5 }}>{icon}</Box>}
    <Box>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  </Box>
);

export default ProfileView;
