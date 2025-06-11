import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Card,
  CardMedia,
  Divider,
  Stack,
  useTheme,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Featured from "../../components/featured/Featured";
import Slide from "../../components/Slide/Slide";
import CatCard from "../../components/catCard/CatCard";
import { cards } from "../../data";
import ProjectCard from "../../components/projectCard/Projectcard";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [recentGigs, setRecentGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const theme = useTheme();

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const response = await newRequest.get("/services?sort=recent");
        setRecentGigs(response.data.services);
      } catch (err) {
        setError(
          "Something went wrong: check your network! or refresh the page",
          err
        );
      } finally {
        setLoading(false);
      }
    };
    fetchGigs();
  }, []);

  if (loading)
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Typography variant="h6" color="error">
        {error}
      </Typography>
    );

  const handleUserGigsClick = (serviceId) => {
    navigate(`/service/${serviceId}`);
  };

  return (
    <Box>
      <Featured />
      {/* Categories Section */}
      <Typography
        variant="h4"
        textAlign="center"
        fontWeight={600}
        sx={{ mt: 10, fontFamily: "Montserrat, sans-serif" }}
      >
        ..Popular categories..
      </Typography>
      <Box sx={{ width: "90%", margin: "0 auto" }}>
      <Slide slidesToShow={4} arrowsScroll={1}>
          {cards.map((card) => (
            <Box key={card.id} sx={{ padding: "0 10px" }}>
              <CatCard item={card} />
            </Box>
          ))}
        </Slide>
      </Box>
      {/* Features Section */}
      <Box
        sx={{
          mt: 5,
          backgroundColor: "#F8F8FF ",
          display: "flex",
          justifyContent: "center",
          padding: { xs: "20px 5px", md: "25px 0" }, // Reduced height
          borderRadius: "10px",
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          <Card
            elevation={12}
            sx={{
              borderRadius: { xs: "4px", md: "8px" },
              overflow: "hidden",
              background: "none",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
              position: "relative",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            {/* Left Section (Image) */}
            <Box
              sx={{
                width: { xs: "100%", md: "50%" },
                position: "relative",
                height: { xs: "280px", md: "auto" },
              }}
            >
              <CardMedia
                component="img"
                image="./img/h2.png"
                alt="How it works"
                sx={{
                  height: "100%",
                  width: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>

            {/* Right Section (Content) */}
            <Box
              sx={{
                width: { xs: "100%", md: "50%" },
                backgroundColor: "#164863", // Vibrant blue from the image
                color: "white",
                padding: { xs: 3, sm: 4, md: 5 },
              }}
            >
              <Typography
                variant="h4"
                fontWeight={600}
                mb={3}
                sx={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: { xs: "24px", sm: "28px", md: "32px" },
                }}
              >
                How it works?
              </Typography>

              <Divider
                sx={{
                  mb: 4,
                  width: "60px",
                  borderColor: "rgba(255,255,255,0.4)",
                  borderBottomWidth: 3,
                }}
              />

              <Stack spacing={3}>
                {/* Step 1 */}
                <Box>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="flex-start"
                    mb={1}
                  >
                    <CheckCircleIcon
                      sx={{ color: "#E6C567", mt: 0.5, fontSize: 24 }}
                    />
                    <Typography
                      variant="h6"
                      fontWeight={500}
                      sx={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: { xs: "16px", md: "18px" },
                      }}
                    >
                      Choose a service by price, skill, and reviews.
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "Montserrat, sans-serif",
                      opacity: 0.85,
                      ml: 4,
                      lineHeight: 1.6,
                      fontSize: { xs: "13px", md: "14px" },
                    }}
                  >
                    Choose the service that you want using advanced filters,
                    making it easy to select using various metrics such as price
                    and reviews.
                  </Typography>
                </Box>

                {/* Step 2 */}
                <Box>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="flex-start"
                    mb={1}
                  >
                    <CheckCircleIcon
                      sx={{ color: "#E6C567", mt: 0.5, fontSize: 24 }}
                    />
                    <Typography
                      variant="h6"
                      fontWeight={500}
                      sx={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: { xs: "16px", md: "18px" },
                      }}
                    >
                      Schedule or book the service by contacting them.
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "Montserrat, sans-serif",
                      opacity: 0.85,
                      ml: 4,
                      lineHeight: 1.6,
                      fontSize: { xs: "13px", md: "14px" },
                    }}
                  >
                    Schedule the service according to your preferred time and
                    other requirements, then book it by contacting the service
                    provider directly.
                  </Typography>
                </Box>

                {/* Step 3 */}
                <Box>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="flex-start"
                    mb={1}
                  >
                    <CheckCircleIcon
                      sx={{ color: "#E6C567", mt: 0.5, fontSize: 24 }}
                    />
                    <Typography
                      variant="h6"
                      fontWeight={500}
                      sx={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: { xs: "16px", md: "18px" },
                      }}
                    >
                      Pay directly to the service.
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "Montserrat, sans-serif",
                      opacity: 0.85,
                      ml: 4,
                      lineHeight: 1.6,
                      fontSize: { xs: "13px", md: "14px" },
                    }}
                  >
                    Pay directly to the provider using various payment methods
                    after the service is completed.
                  </Typography>
                </Box>
              </Stack>

              {/* Read More Link */}
              <Box mt={4} display="flex" justifyContent="flex-end"></Box>
            </Box>
          </Card>
        </Container>
      </Box>
      {/* New Listings Section */}
      <Typography
        variant="h4"
        textAlign="center"
        fontWeight={600}
        sx={{ mt: 8, mb: 1, fontFamily: "Montserrat, sans-serif" }}
      >
        ..New Listings..
      </Typography>
      {/* Recent Gigs Section */}
      <Box>
        <Slide slidesToShow={4} arrowsScroll={2}>
          {Array.isArray(recentGigs) && recentGigs.length > 0 ? (
            recentGigs.map((service) => (
              <ProjectCard
                key={service.id}
                item={service}
                onClick={() => handleUserGigsClick(service.userId.username)}
              />
            ))
          ) : (
            <Typography variant="body1" textAlign="center">
              No recent gigs available
            </Typography>
          )}
        </Slide>
      </Box>
    </Box>
  );
};

export default Home;
