import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Chip,
  Grid,
  Paper,
  Divider,
  Container,
  alpha,
  useTheme,
  useMediaQuery,
  Stack,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CategoryIcon from "@mui/icons-material/Category";
import SellIcon from "@mui/icons-material/Sell";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import newRequest from "../../utils/newRequest";

const GigDetails = () => {
  const { id } = useParams(); // Get gig ID from URL
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchGigDetails();
  }, [id]);

  const fetchGigDetails = async () => {
    try {
      const response = await newRequest.get(`/admin/service/${id}`);
      setGig(response.data);
    } catch (err) {
      console.error("Error fetching gig details:", err);
      setError("Gig not found.");
    } finally {
      setLoading(false);
    }
  };

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
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.error.light, 0.1),
          }}
        >
          <Typography variant="h5" color="error">
            {error}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Paper
        elevation={3}
        sx={{
          overflow: "hidden",
          borderRadius: 2,
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-5px)",
          },
        }}
      >
        <Grid container>
          <Grid item xs={12}>
            <CardMedia
              component="img"
              height={isMobile ? "200" : "400"}
              image={gig.cover}
              alt={gig.title}
              sx={{
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Box sx={{ mb: 3 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mb: 1 }}
                >
                  <CategoryIcon color="primary" fontSize="small" />
                  <Typography
                    variant="subtitle1"
                    color="primary"
                    fontWeight="600"
                    sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                  >
                    {gig.cat}
                  </Typography>
                </Stack>
                <Typography
                  variant="h6"
                  component="h4"
                  gutterBottom
                  sx={{
                    fontWeight: 200,
                    fontSize: { xs: "0.5rem", md: "1rem" },
                  }}
                >
                  {formatDate(gig.createdAt)}
                </Typography>
                <Typography
                  variant="h4"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "1.5rem", md: "2rem" },
                  }}
                >
                  {gig.title}
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ fontWeight: 500, mb: 2 }}
                >
                  {gig.shortTitle}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ my: 3 }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, mb: 2 }}
                  component="h2"
                >
                  About this service
                </Typography>
                <Typography
                  variant="body1"
                  paragraph
                  sx={{
                    lineHeight: 1.8,
                    color: alpha(theme.palette.text.primary, 0.9),
                  }}
                >
                  {gig.desc}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 2,
                  mb: 4,
                  p: 2,
                  backgroundColor: alpha(theme.palette.primary.light, 0.1),
                  borderRadius: 1,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <SellIcon color="primary" />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    ₹{gig.price}
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ my: 3 }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, mb: 2 }}
                  component="h2"
                >
                  Features
                </Typography>
                <Grid container spacing={1}>
                  {Array.isArray(gig.features) && gig.features.length > 0 ? (
                    <Grid container spacing={1}>
                      {gig.features.map((feature, index) => (
                        <Grid item key={index}>
                          <Chip
                            icon={<CheckCircleIcon />}
                            label={feature}
                            color="primary"
                            variant="outlined"
                            sx={{
                              borderRadius: "16px",
                              py: 0.5,
                              fontWeight: 500,
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      No features available
                    </Typography>
                  )}
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ my: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                  component="h2"
                >
                  <LocationOnIcon color="primary" /> Availability zones
                </Typography>

                <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Pincodes
                  </Typography>
                  <Typography variant="body1">
                    {Array.isArray(gig.locationA)
                      ? gig.locationA.join(", ")
                      : "No pincodes available"}
                  </Typography>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Cities
                  </Typography>
                  <Typography variant="body1">
                    {Array.isArray(gig.locationB)
                      ? gig.locationB.join(", ")
                      : "No cities available"}
                  </Typography>
                </Paper>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ my: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                  component="h2"
                >
                  <CalendarMonthIcon color="primary" /> Availability
                </Typography>
                {gig.availability.length > 0 ? (
                  <Grid container spacing={2}>
                    {gig.availability.map((slot, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper
                          elevation={1}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            transition: "all 0.2s",
                            "&:hover": {
                              backgroundColor: alpha(
                                theme.palette.primary.light,
                                0.1
                              ),
                            },
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600 }}
                          >
                            {slot.date}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                slot.slots.length > 0
                                  ? "success.main"
                                  : "warning.main",
                              fontWeight: 500,
                            }}
                          >
                            {slot.slots.length} slots available
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.warning.light, 0.1),
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      No available slots
                    </Typography>
                  </Paper>
                )}
              </Box>
            </CardContent>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default GigDetails;
