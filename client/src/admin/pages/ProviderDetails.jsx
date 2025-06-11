import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Typography,
  CircularProgress,
  Box,
  Divider,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  Container,
  Paper,
  Avatar,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import BusinessIcon from "@mui/icons-material/Business";
import VerifiedIcon from "@mui/icons-material/Verified";
import newRequest from "../../utils/newRequest";

const ProviderDetails = () => {
  const { userId } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchProviderDetails = async () => {
      try {
        const response = await newRequest.get(`/admin/${userId}`, {
          withCredentials: true,
        });
        setProvider(response.data);
        console.log("Provider Data:", response.data);
      } catch (error) {
        console.error("Error fetching provider details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderDetails();
  }, [userId]);

  // Format date function to convert UTC date to a standard format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
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

  // Helper function to format field displays
  const InfoField = ({ label, value, icon }) => (
    <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1.5 }}>
      {icon && <Box sx={{ mr: 1, color: "primary.main" }}>{icon}</Box>}
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1" fontWeight={500}>
          {value || "N/A"}
        </Typography>
      </Box>
    </Box>
  );

  const getStatusChip = (approvedByAdmin) => {
    let color = "default";
    let label = "N/A"; // Default label
  
    if (approvedByAdmin === true) {
      color = "success";
      label = "Yes";
    } else if (approvedByAdmin === false) {
      color = "warning";
      label = "No";
    }
  
    return (
      <Chip
        label={label}
        color={color}
        size="small"
        sx={{ textTransform: "capitalize" }}
      />
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.05)",
          mb: 4,
        }}
      >
        {provider ? (
          <>
            {/* Header Section */}
            <Box
              sx={{
                p: 3,
                background: "linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)",
                color: "white",
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: "rgba(255,255,255,0.2)",
                      border: "2px solid white",
                    }}
                  >
                    {provider.fullName
                      ? provider.fullName.charAt(0).toUpperCase()
                      : "U"}
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h5" fontWeight="bold">
                    {provider.fullName || provider.username}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ mr: 1 }}>
                      ID: {provider.id}
                    </Typography>
                    {getStatusChip(provider.approvedByAdmin)}
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ mr: 1 }}>
                      Created At: {formatDate(provider?.createdAt)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ p: 3 }}>
              <Grid container spacing={4}>
                {/* User Information Card */}
                <Grid item xs={12} md={6}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <AccountCircleIcon
                          sx={{ mr: 1, color: "primary.main" }}
                        />
                        <Typography variant="h6" fontWeight="bold">
                          User Information
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <InfoField
                            label="Username"
                            value={provider.username}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoField
                            label="Full Name"
                            value={provider.fullName}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <InfoField label="Email" value={provider.email} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoField label="Phone" value={provider.phone} />
                        </Grid>
                        <Grid item xs={12}>
                          <InfoField label="Address" value={provider.address} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoField label="City" value={provider.city} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoField label="Pincode" value={provider.pincode} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoField
                            label="Date of Birth"
                            value={formatDate(provider?.providerDetails?.dob) || "N/A"}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Provider Information Card */}
                <Grid item xs={12} md={6}>
                  {provider.isSeller &&
                  provider.appliedForProvider &&
                  provider.providerDetails ? (
                    <Card
                      elevation={0}
                      sx={{
                        height: "100%",
                        borderRadius: 2,
                        border: "1px solid rgba(0,0,0,0.08)",
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <BusinessIcon sx={{ mr: 1, color: "primary.main" }} />
                          <Typography variant="h6" fontWeight="bold">
                            Provider Information
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <InfoField
                              label="Business Name"
                              value={provider.providerDetails.providerName}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <InfoField
                              label="Profession"
                              value={provider.providerDetails.profession}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <InfoField
                              label="Experience"
                              value={provider.providerDetails.experience}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <InfoField
                              label="Service Level"
                              value={provider.providerDetails.serviceLevel}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <InfoField
                              label="Service Hours"
                              value={provider.providerDetails.serviceHours}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <InfoField
                              label="Business Email"
                              value={provider.providerDetails.providerEmail}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <InfoField
                              label="Business Address"
                              value={provider.providerDetails.providerAddress}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <InfoField
                              label="Business Phone"
                              value={provider.providerDetails.providerPhone}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card
                      elevation={0}
                      sx={{
                        height: "100%",
                        borderRadius: 2,
                        border: "1px solid rgba(0,0,0,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CardContent sx={{ textAlign: "center" }}>
                        <BusinessIcon
                          sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
                        />
                        <Typography variant="h6" color="text.secondary">
                          No provider details available
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          This is a regular user account
                        </Typography>
                      </CardContent>
                    </Card>
                  )}
                </Grid>
              </Grid>

              {/* Document Verification Card */}
              {provider.isSeller &&
                provider.appliedForProvider &&
                provider.providerDetails &&
                provider.providerDetails.verify && (
                  <Card
                    elevation={0}
                    sx={{
                      mt: 4,
                      borderRadius: 2,
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <VerifiedIcon sx={{ mr: 1, color: "primary.main" }} />
                        <Typography variant="h6" fontWeight="bold">
                          Verification Document
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 3 }} />

                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          height: { xs: 300, sm: 400, md: 600 },
                          borderRadius: 2,
                          overflow: "hidden",
                          backgroundColor: "#f5f5f5",
                          border: "1px solid rgba(0,0,0,0.08)",
                        }}
                      >
                        <Box
                          component="img"
                          src={provider.providerDetails.verify}
                          alt="Verification Document"
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                )}
            </Box>
          </>
        ) : (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              No User details found.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ProviderDetails;
