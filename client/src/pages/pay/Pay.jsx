
import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import newRequest from "../../utils/newRequest";
import { useParams } from "react-router-dom";
import CheckoutForm from "../../components/checkoutForm/CheckoutForm";
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Fade,
  useTheme,
  useMediaQuery,
  Stack,
  Chip,
  Divider
} from "@mui/material";
import {
  Payment as PaymentIcon,
  Security as SecurityIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from "@mui/icons-material";

const stripePromise = loadStripe(
  "pk_test_51RZ4b2GgbP9bkLoKRysU1zk4J9OrZa7gm623c2i6Jg8sADTA5eP6vEFH2U9MOohj9W8C77wg8G1dWFwi4G6ufsDS0056CJRX8x"
);

const Pay = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const { bookingId } = useParams();

  // Debug logs
  console.log("Pay component - bookingId from params:", bookingId);
  console.log("Pay component - current URL:", window.location.href);
  console.log("Pay component - all params:", useParams());

  useEffect(() => {
    const makeRequest = async () => {
      // Check if bookingId exists
      if (!bookingId) {
        setError("Booking ID is missing from URL");
        setLoading(false);
        return;
      }

      try {
        console.log("Making payment intent request for bookingId:", bookingId);
        
        const res = await newRequest.post(
          `/bookings/create-payment-intent/${bookingId}`
        );
        
        console.log("Payment intent response:", res.data);
        setClientSecret(res.data.clientSecret);
        setLoading(false);
      } catch (err) {
        console.error("Payment intent error:", err);
        setError(err.response?.data?.message || "Failed to create payment intent");
        setLoading(false);
      }
    };
    makeRequest();
  }, [bookingId]);

  const appearance = {
    theme: 'stripe',
  };
  
  const options = {
    clientSecret,
    appearance,
  };

  // Loading State
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 3
        }}
      >
        <Container maxWidth="sm">
          <Fade in={loading}>
            <Paper
              elevation={12}
              sx={{
                p: { xs: 3, sm: 4, md: 6 },
                borderRadius: 3,
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Stack spacing={3} alignItems="center">
                <Box
                  sx={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CircularProgress
                    size={60}
                    thickness={4}
                    sx={{
                      color: theme.palette.primary.main,
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      }
                    }}
                  />
                  <PaymentIcon
                    sx={{
                      position: 'absolute',
                      fontSize: 24,
                      color: theme.palette.primary.main
                    }}
                  />
                </Box>
                
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  fontWeight="600"
                  color="text.primary"
                  sx={{ letterSpacing: '-0.02em' }}
                >
                  Preparing Payment
                </Typography>
                
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ maxWidth: '400px' }}
                >
                  We're setting up your secure payment environment. This will only take a moment.
                </Typography>
                
                <Stack direction="row" spacing={1} alignItems="center">
                  <SecurityIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="caption" color="success.main" fontWeight="500">
                    256-bit SSL Encryption
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Fade>
        </Container>
      </Box>
    );
  }

  // Error State
  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 3
        }}
      >
        <Container maxWidth="md">
          <Fade in={!!error}>
            <Paper
              elevation={12}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(90deg, #ff5252, #f44336)',
                  p: { xs: 2, sm: 3 },
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                <ErrorIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant={isMobile ? "h5" : "h4"} fontWeight="600">
                  Payment Error
                </Typography>
              </Box>
              
              <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                <Alert
                  severity="error"
                  icon={false}
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      width: '100%'
                    }
                  }}
                >
                  <AlertTitle sx={{ fontWeight: 600, mb: 1 }}>
                    Unable to Process Payment
                  </AlertTitle>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {error}
                  </Typography>
                </Alert>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography
                  variant="h6"
                  fontWeight="600"
                  color="text.primary"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <InfoIcon color="primary" />
                  Debug Information
                </Typography>
                
                <Stack spacing={2}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'grey.200'
                    }}
                  >
                    <Stack direction={isTablet ? "column" : "row"} spacing={2}>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="600">
                          BOOKING ID
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            wordBreak: 'break-all',
                            fontFamily: 'monospace',
                            color: bookingId ? 'text.primary' : 'error.main'
                          }}
                        >
                          {bookingId || 'undefined'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ minWidth: 0, flex: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="600">
                          CURRENT URL
                        </Typography>
                        <Typography 
                          variant="body2"
                          sx={{ 
                            wordBreak: 'break-all',
                            fontFamily: 'monospace',
                            fontSize: '0.75rem'
                          }}
                        >
                          {window.location.href}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center', pt: 2 }}>
                    <Chip
                      label="Contact Support if Issue Persists"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Paper>
          </Fade>
        </Container>
      </Box>
    );
  }

  // Payment Form State
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        py: { xs: 2, sm: 3, md: 4 }
      }}
    >
      <Container maxWidth="lg">
        <Fade in={!!clientSecret}>
          <Box>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4, md: 5 } }}>
              <Typography
                variant={isMobile ? "h4" : "h3"}
                fontWeight="700"
                color="white"
                gutterBottom
                sx={{ 
                  letterSpacing: '-0.02em',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                Secure Payment
              </Typography>
              <Typography
                variant="body1"
                color="rgba(255, 255, 255, 0.9)"
                sx={{ maxWidth: '500px', mx: 'auto' }}
              >
                Complete your booking with our secure payment system
              </Typography>
            </Box>

            {/* Payment Form Container */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                px: { xs: 1, sm: 2 }
              }}
            >
              <Card
                elevation={20}
                sx={{
                  width: '100%',
                  maxWidth: '600px',
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  overflow: 'visible',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -2,
                    left: -2,
                    right: -2,
                    bottom: -2,
                    background: 'linear-gradient(45deg, #4facfe, #00f2fe, #4facfe)',
                    borderRadius: 'inherit',
                    zIndex: -1,
                    opacity: 0.1
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                  {/* Security Badge */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'success.50',
                      border: '1px solid',
                      borderColor: 'success.200'
                    }}
                  >
                    <SecurityIcon sx={{ color: 'success.main', mr: 1 }} />
                    <Typography
                      variant="body2"
                      color="success.dark"
                      fontWeight="600"
                    >
                      Your payment is protected by industry-standard encryption
                    </Typography>
                  </Box>

                  {/* Stripe Elements */}
                  {clientSecret && (
                    <Elements options={options} stripe={stripePromise}>
                      <Box
                        sx={{
                          '& .StripeElement': {
                            padding: '16px',
                            borderRadius: '8px',
                            border: '2px solid #e0e0e0',
                            transition: 'border-color 0.2s ease',
                            '&:hover': {
                              borderColor: theme.palette.primary.main
                            },
                            '&:focus': {
                              borderColor: theme.palette.primary.main,
                              boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`
                            }
                          }
                        }}
                      >
                        <CheckoutForm />
                      </Box>
                    </Elements>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Trust Indicators */}
            <Box
              sx={{
                mt: { xs: 3, sm: 4 },
                textAlign: 'center'
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                alignItems="center"
              >
                <Chip
                  icon={<SecurityIcon />}
                  label="SSL Secured"
                  variant="outlined"
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '& .MuiChip-icon': { color: 'white' }
                  }}
                />
                <Chip
                  icon={<PaymentIcon />}
                  label="Stripe Powered"
                  variant="outlined"
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '& .MuiChip-icon': { color: 'white' }
                  }}
                />
              </Stack>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default Pay;