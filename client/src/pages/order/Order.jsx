import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Avatar,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  Button,
} from "@mui/material";
import {
  CheckCircle,
  Pending,
  Cancel,
  Event,
  AccessTime,
  Note,
  Phone,
  LocationOn,
  Business,
  WorkHistory,
  Schedule,
  Stars,
  Description,
  People,
  Download,
} from "@mui/icons-material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Order = () => {
  const { id: bookingId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await newRequest.get(`/bookings/${bookingId}`);
        setOrderDetails(res.data);
        console.log(res.data);
      } catch (err) {
        setError(err.response?.data || "Error fetching order details");
      }
    };

    fetchOrderDetails();
  }, [bookingId]);

  // Status Badge Styling
  const getStatusChip = (status) => {
    let color, icon, bgColor;
    switch (status.toLowerCase()) {
      case "confirmed":
        color = "success";
        icon = <CheckCircle />;
        bgColor = "rgba(46, 125, 50, 0.1)";
        break;
      case "pending":
        color = "warning";
        icon = <Pending />;
        bgColor = "rgba(237, 108, 2, 0.1)";
        break;
      case "cancelled":
        color = "error";
        icon = <Cancel />;
        bgColor = "rgba(211, 47, 47, 0.1)";
        break;
      default:
        color = "default";
        icon = null;
        bgColor = "rgba(0, 0, 0, 0.1)";
    }
    return (
      <Chip
        label={status}
        color={color}
        icon={icon}
        sx={{
          fontWeight: 600,
          borderRadius: "8px",
          backgroundColor: bgColor,
          '& .MuiChip-icon': {
            marginLeft: '10px',
          },
          padding: '4px',
        }}
      />
    );
  };

  // PDF Generation Function
  const generatePDF = async () => {
    if (!contentRef.current || isGeneratingPdf) return;
    
    setIsGeneratingPdf(true);
    
    try {
      const content = contentRef.current;
      const canvas = await html2canvas(content, { 
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Generate a filename with booking ID and date
      const fileName = `Order_${bookingId}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('There was an error generating the PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              textAlign: "center",
              border: `1px solid ${theme.palette.error.light}`,
              backgroundColor: "rgba(211, 47, 47, 0.05)",
            }}
          >
            <Typography color="error" variant="h5" fontWeight={600}>
              Oops! Something went wrong
            </Typography>
            <Typography color="error" variant="body1" sx={{ mt: 1 }}>
              {error}
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (!orderDetails) {
    return (
      <Container maxWidth="lg">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress size={60} thickness={4} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, pb: 6 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: "white",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div ref={contentRef}>
          <Typography 
            variant={isMobile ? "h5" : "h4"}
            align="center" 
            fontWeight={700} 
            color="primary.main"
            sx={{ 
              mb: 3,
              backgroundImage: "linear-gradient(90deg, #2196f3, #7e57c2)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Order Summary
          </Typography>
          
          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={3}>
            {/* Order Details */}
            <Grid item xs={12}>
              <Card 
                elevation={0} 
                sx={{ 
                  borderRadius: 3, 
                  overflow: "hidden",
                  border: `1px solid ${theme.palette.divider}`,
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                <Box sx={{ backgroundColor: theme.palette.primary.main, height: "8px" }} />
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    Service Details
                  </Typography>
                  
                  <Box 
                    display="flex" 
                    flexDirection={isMobile ? "column" : "row"}
                    alignItems={isMobile ? "flex-start" : "center"} 
                    gap={2}
                  >
                    <Box
                      sx={{
                        width: { xs: "100%", sm: "100px" },
                        height: { xs: "200px", sm: "100px" },
                        position: "relative",
                        overflow: "hidden",
                        borderRadius: "12px",
                      }}
                    >
                      <img
                        src={orderDetails.img}
                        alt="Service"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography 
                        fontWeight={600} 
                        variant="h6" 
                        sx={{ mb: 1 }}
                      >
                        {orderDetails.title}
                      </Typography>
                      
                      <Typography 
                        color="primary" 
                        variant="h6" 
                        fontWeight={700} 
                        sx={{ mb: 1 }}
                      >
                        ₹{orderDetails.price}
                      </Typography>
                      
                      {getStatusChip(orderDetails.status)}
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Event color="primary" />
                          <Typography>
                            <Typography component="span" fontWeight={600}>Preferred Date:</Typography>{" "}
                            {orderDetails.preferredDate}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AccessTime color="primary" />
                          <Typography>
                            <Typography component="span" fontWeight={600}>Preferred Time:</Typography>{" "}
                            {orderDetails.preferredTime}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="flex-start" gap={1}>
                          <Note color="primary" sx={{ mt: 0.5 }} />
                          <Typography>
                            <Typography component="span" fontWeight={600}>Notes:</Typography>{" "}
                            {orderDetails.notes || "No additional notes provided"}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Customer & Provider Details */}
            <Grid item xs={12} md={6}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: "100%",
                  borderRadius: 3, 
                  overflow: "hidden",
                  border: `1px solid ${theme.palette.divider}`,
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                <Box sx={{ backgroundColor: "#4caf50", height: "8px" }} />
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                    Customer Details
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3 }}>
                    <Avatar 
                    src = {orderDetails.buyerDetails.image}
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        objectFit: "contain",
                        bgcolor: "#4caf50",
                        fontSize: "1.5rem",
                        fontWeight: "bold"
                      }}
                    >
                    </Avatar>
                    <Box>
                      <Typography fontWeight={600} variant="h6">
                        {orderDetails.buyerDetails.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {orderDetails.buyerDetails.email}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mt: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                      <People fontSize="small" color="success" />
                      <Typography>
                        <Typography component="span" fontWeight={600}>Name:</Typography>{" "}
                        {orderDetails.buyerDetails.fullName}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                      <Phone fontSize="small" color="success" />
                      <Typography>
                        <Typography component="span" fontWeight={600}>Phone:</Typography>{" "}
                        {orderDetails.buyerDetails.phone}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="flex-start" gap={1}>
                      <LocationOn fontSize="small" color="success" sx={{ mt: 0.5 }} />
                      <Typography>
                        <Typography component="span" fontWeight={600}>Address:</Typography>{" "}
                        {orderDetails.buyerDetails.address}, {orderDetails.buyerDetails.city} - {orderDetails.buyerDetails.pincode}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: "100%",
                  borderRadius: 3, 
                  overflow: "hidden",
                  border: `1px solid ${theme.palette.divider}`,
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                <Box sx={{ backgroundColor: "#ff9800", height: "8px" }} />
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                    Provider Details
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3 }}>
                    <Avatar 
                      src = {orderDetails?.sellerDetails?.image}
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        objectFit: "contain",
                        bgcolor: "#ff9800",
                        fontSize: "1.5rem",
                        fontWeight: "bold"
                      }}
                    >
                    </Avatar>
                    <Box>
                      <Typography fontWeight={600} variant="h6">
                        {orderDetails.sellerDetails.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {orderDetails.providerDetails?.providerEmail || ""}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mt: 2 }}>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                      <People fontSize="small" color="warning" />
                      <Typography>
                        <Typography component="span" fontWeight={600}>Business name:</Typography>{" "}
                        {orderDetails.providerDetails?.providerName}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                      <Phone fontSize="small" color="warning" />
                      <Typography>
                        <Typography component="span" fontWeight={600}>Business Phone:</Typography>{" "}
                        {orderDetails.providerDetails?.providerPhone}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="flex-start" gap={1}>
                      <LocationOn fontSize="small" color="warning" sx={{ mt: 0.5 }} />
                      <Typography>
                        <Typography component="span" fontWeight={600}>Business Address:</Typography>{" "}
                        {orderDetails.providerDetails?.providerAddress}, {orderDetails.sellerDetails.city} - {orderDetails.sellerDetails.pincode}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            

            {/* Additional Provider Details */}
            {orderDetails.providerDetails && (
              <Grid item xs={12}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    borderRadius: 3, 
                    overflow: "hidden",
                    border: `1px solid ${theme.palette.divider}`,
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                    },
                  }}
                >
                  <Box sx={{ backgroundColor: "#7e57c2", height: "8px" }} />
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                      Additional Provider Information
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                          <Business fontSize="small" color="secondary" />
                          <Typography>
                            <Typography component="span" fontWeight={600}>Profession:</Typography>{" "}
                            {orderDetails.providerDetails.profession}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                          <WorkHistory fontSize="small" color="secondary" />
                          <Typography>
                            <Typography component="span" fontWeight={600}>Experience:</Typography>{" "}
                            {orderDetails.providerDetails.experience} years
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                          <Schedule fontSize="small" color="secondary" />
                          <Typography>
                            <Typography component="span" fontWeight={600}>Service Hours:</Typography>{" "}
                            {orderDetails.providerDetails.serviceHours}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                          <Stars fontSize="small" color="secondary" />
                          <Typography>
                            <Typography component="span" fontWeight={600}>Service Level:</Typography>{" "}
                            {orderDetails.providerDetails.serviceLevel}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="flex-start" gap={1}>
                          <Description fontSize="small" color="secondary" sx={{ mt: 0.5 }} />
                          <Typography>
                            <Typography component="span" fontWeight={600}>Service description:</Typography>{" "}
                            {orderDetails.providerDetails.desc}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </div>
        
        {/* PDF Download Button */}
        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={generatePDF}
            disabled={isGeneratingPdf}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: 2,
              backgroundColor: theme.palette.primary.main,
              color: "white",
              fontWeight: 600,
              fontSize: "1rem",
              boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
                boxShadow: "0 6px 16px rgba(33, 150, 243, 0.4)",
              },
              "&:disabled": {
                backgroundColor: theme.palette.action.disabledBackground,
              },
              transition: "all 0.3s ease",
            }}
          >
            {isGeneratingPdf ? "Generating PDF..." : "Download Order Details as PDF"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Order;