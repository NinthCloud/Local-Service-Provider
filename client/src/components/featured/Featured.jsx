import React from "react";
import { Box, Container, Typography, Grid, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const Featured = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        width: "100%",
        height: { xs: "auto", sm: "auto", md: "450px" }, // More flexible height for mobile
        minHeight: { xs: "450px", sm: "400px" }, // Increased min-height for small screens
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#FAFAFA",
        color: "#121212",
        position: "relative",
        overflow: "hidden",
        py: { xs: 5, sm: 4, md: 0 }, // More padding on very small screens
      }}
    >
      <Container maxWidth="lg" sx={{ height: "100%", position: "relative" }}>
        <Grid container sx={{ height: "100%" }} spacing={{ xs: 2, md: 0 }}>
          {/* Text Content */}
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: { xs: 2, sm: 3, md: 4, lg: 6 },
              position: "relative",
              zIndex: 2,
              order: { xs: 2, md: 1 }, // Reorder on mobile
              mt: { xs: 2, sm: 0 }, // Add margin top on very small screens
            }}
          >
            <Box sx={{ maxWidth: { xs: "100%", md: "450px" } }}>
              <Typography
                variant="h6"
                sx={{
                  mt: { xs: 0, md: 2 },
                  mb: { xs: 4, md: 5 },
                  opacity: 0.8,
                  maxWidth: "500px",
                  fontWeight: 400,
                  lineHeight: 1.6,
                  fontStyle: "italic",
                  fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                  textAlign: { xs: "center", md: "left" }, // Center text on mobile
                }}
              >
                Hire the best local services from your doorstep. Connect with
                trusted professionals in your neighborhood for all your service
                needs.
              </Typography>
            </Box>
          </Grid>

          {/* Center Image Area */}
          <Grid
            item
            xs={12}
            md={7}
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "center", md: "flex-start" },
              height: { xs: "280px", sm: "320px", md: "100%" }, // Taller on mobile
              order: { xs: 1, md: 2 }, // Reorder on mobile
              overflow: { xs: "visible", md: "visible" },
              // Ensure image extends to bottom
              pb: { xs: 0, md: 0 },
              alignSelf: "stretch",
            }}
          >
            {/* Image */}
            <Box
              component="img"
              src="/img/w2.png"
              alt="Profile silhouette"
              sx={{
                height: { xs: "auto", md: "100%" },
                maxHeight: { xs: "280px", sm: "320px", md: "100%" }, // Changed to 100% for md to touch bottom
                width: "auto",
                maxWidth: { xs: "95%", sm: "90%", md: "auto" }, // Wider on mobile
                objectFit: "contain",
                objectPosition: { xs: "center", md: "center bottom" }, // Position at bottom for md screens
                zIndex: 2,
                position: "relative",
                mx: { xs: "auto", md: 0 }, // Center on mobile
                display: "block",
                bottom: 0,
              }}
            />
            
            {/* Find, Book, Relax text */}
            <Box
              sx={{
                position: "absolute",
                zIndex: 3,
                left: { xs: "auto", md: "auto", lg: "70%" }, 
                right: { xs: "0%", sm: "10%", md: "10%", lg: "auto" }, // Adjusted for better mobile visibility
                top: { xs: "60%", md: "60%" },
                transform: "translateY(-50%)",
                textAlign: "left",
                width: { xs: "auto", md: "auto" },
              }}
            >
              <Typography
                variant={isMobile ? "body1" : isTablet ? "h6" : "h6"}
                fontWeight={500}
                sx={{
                  fontFamily: "Montserrat, sans-serif",
                  letterSpacing: "-0.5px",
                  lineHeight: 1.2,
                  marginBottom: { xs: 1, md: 3 },
                  fontSize: { 
                    xs: "1.8rem", // Slightly larger on mobile
                    sm: "2.2rem", // Larger on small tablets
                    md: "2.5rem", 
                    lg: "3rem" 
                  },
                  textShadow: { xs: "0 0 10px rgba(255,255,255,0.7)", md: "none" }, // Text shadow for mobile visibility
                }}
              >
                <span style={{ color: "#164863" }}>Find,</span> <br />
                <span style={{ color: "#164863" }}>Book,</span> <br />
                <span style={{ fontStyle: "italic", fontSize: "110%" }}>Relax.</span>
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        {/* Social Media Icons - Bottom Left - SMALLER SIZE */}
        {/* <Box
          sx={{
            position: "absolute",
            bottom: { xs: "15px", md: "20px" }, // Slightly higher on mobile
            left: { xs: "15px", md: "20px" },
            display: "flex",
            gap: { xs: 1.1, md: 1.35 }, // Reduced spacing for smaller icons
            zIndex: 10,
          }}
        >
          {[
            { Icon: FacebookIcon, label: "Facebook" },
            { Icon: TwitterIcon, label: "Twitter" },
            { Icon: InstagramIcon, label: "Instagram" },
            { Icon: LinkedInIcon, label: "LinkedIn" },
          ].map(({ Icon, label }) => (
            <IconButton
              key={label}
              aria-label={label}
              size="small" // Force small size for all screens
              sx={{
                bgcolor: "#164863",
                color: "white",
                p: { xs: 0.3, sm: 0.5 }, // Smaller padding for reduced size
                width: { xs: "20px", sm: "24px", md: "26px" }, // Explicit width control
                height: { xs: "20px", sm: "24px", md: "26px" }, // Explicit height control
                minWidth: { xs: "20px", sm: "24px", md: "26px" }, // Ensure minimum width
                minHeight: { xs: "20px", sm: "24px", md: "26px" }, // Ensure minimum height
                "&:hover": {
                  bgcolor: "#0c2b3e",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <Icon fontSize="small" sx={{ fontSize: { xs: "14px", sm: "16px", md: "18px" } }} />
            </IconButton>
          ))}
        </Box> */}
        
        {/* ServiceHub, IL - Bottom Right */}
        <Typography
          variant="body1"
          sx={{
            position: "absolute",
            bottom: { xs: "15px", md: "20px" }, // Slightly higher on mobile
            right: { xs: "15px", md: "20px" },
            fontSize: { xs: "0.8rem", sm: "0.9rem" }, // Increased size for readability
            color: "#555",
            zIndex: 10,
            textShadow: { xs: "0 0 5px rgba(255,255,255,0.7)", md: "none" }, // Text shadow for mobile visibility
          }}
        >
          ServiceHub, IL
        </Typography>
      </Container>
    </Box>
  );
};

export default Featured;