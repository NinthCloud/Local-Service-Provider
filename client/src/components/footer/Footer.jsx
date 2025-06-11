import React from "react";
import { Box, Container, Grid, Typography, Link, IconButton } from "@mui/material";
import { Facebook, Twitter, Instagram, LinkedIn, Pinterest, Language, CurrencyRupee } from "@mui/icons-material";

// Footer component
const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#F5F5F5",
        color: "black",
        py: 4,
        px: 2,
        mt: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Top Section */}
        <Grid container spacing={4} justifyContent="center">
          {/* Contact Info */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2">servicehub.Ltd@gmail.com</Typography>
            <Typography variant="body2">+91-0000-000000</Typography>
            <Typography variant="body2">+91-0000-000000</Typography>
          </Grid>

          {/* Company Links */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Company
            </Typography>
            <Link href="#" underline="none" color="inherit" display="block">About Us</Link>
            <Link href="#" underline="none" color="inherit" display="block">Blogs</Link>
            <Link href="#" underline="none" color="inherit" display="block">Help</Link>
            <Link href="#" underline="none" color="inherit" display="block">Terms & Conditions</Link>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Links
            </Typography>
            <Link href="profile" underline="none" color="inherit" display="block">My Account</Link>
            <Link href="gigs?cat" underline="none" color="inherit" display="block">Marketplace</Link>
            <Link href="wishlist" underline="none" color="inherit" display="block">Wishlist</Link>
            <Link href="orders" underline="none" color="inherit" display="block">My Orders</Link>
          </Grid>
        </Grid>

        {/* Divider */}
        <Box sx={{ mt: 4, borderBottom: "1px solid white", opacity: 0.2 }} />

        {/* Bottom Section */}
        <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} alignItems="center" justifyContent="space-between" mt={3}>
          {/* Left */}
          <Typography variant="body2" textAlign={{ xs: "center", sm: "left" }}>
            © ServiceHub International Ltd. 2025
          </Typography>

          {/* Social Icons */}
          <Box display="flex" gap={2} mt={{ xs: 2, sm: 0 }}>
            <IconButton color="inherit"><Facebook /></IconButton>
            <IconButton color="inherit"><Twitter /></IconButton>
            <IconButton color="inherit"><LinkedIn /></IconButton>
            <IconButton color="inherit"><Pinterest /></IconButton>
            <IconButton color="inherit"><Instagram /></IconButton>
          </Box>

          {/* Language & Currency */}
          <Box display="flex" gap={3} mt={{ xs: 2, sm: 0 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Language />
              <Typography>English</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <CurrencyRupee />
              <Typography>INR</Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
