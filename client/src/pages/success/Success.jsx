
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepIcon,
  Chip,
  Stack,
  Divider,
  Fade,
  Zoom,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Backdrop
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ShoppingBag as ShoppingBagIcon,
  Support as SupportIcon,
  Payment as PaymentIcon,
  BookOnline as BookOnlineIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from "@mui/icons-material";

const Success = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const params = new URLSearchParams(search);
  const payment_intent = params.get("payment_intent");
  const redirect_status = params.get("redirect_status");
  
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const maxAttempts = 3;

  const steps = [
    'Payment Processed',
    'Confirming Booking',
    'Complete'
  ];

  useEffect(() => {
    const confirmPayment = async (attemptNumber = 1) => {
      try {
        console.log(`=== CONFIRMATION ATTEMPT ${attemptNumber} ===`);
        console.log("Payment Intent:", payment_intent);
        console.log("Redirect Status:", redirect_status);
        
        if (!payment_intent) {
          setError("No payment intent found in URL");
          setIsProcessing(false);
          return;
        }
        
        setCurrentStep(1);
        setAttempts(attemptNumber);
        
        // Progressive delay: 2s, 4s, 6s for retries
        const delay = attemptNumber * 2000;
        console.log(`Waiting ${delay}ms before confirmation...`);
        
        // Animate progress during delay
        const progressInterval = setInterval(() => {
          setProgress(prev => Math.min(prev + 10, 90));
        }, delay / 10);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        clearInterval(progressInterval);

        const response = await newRequest.put("/bookings/confirm", { 
          payment_intent,
          attempt: attemptNumber
        });
        
        console.log("Confirmation successful:", response.data);
        setProgress(100);
        setCurrentStep(2);
        setIsProcessing(false);
        
        // Redirect after success
        setTimeout(() => {
          navigate("/orders");
        }, 2000);
        
      } catch (err) {
        console.error(`Attempt ${attemptNumber} failed:`, err);
        
        setAttempts(attemptNumber);
        
        if (attemptNumber < maxAttempts) {
          console.log(`Retrying... (${attemptNumber}/${maxAttempts})`);
          setCurrentStep(1);
          // Retry with exponential backoff
          setTimeout(() => {
            confirmPayment(attemptNumber + 1);
          }, 2000 * attemptNumber);
        } else {
          // All attempts failed
          console.log("All confirmation attempts failed");
          const errorMsg = err.response?.data || err.message || "Confirmation failed after multiple attempts";
          setError(errorMsg);
          setIsProcessing(false);
          setProgress(0);
        }
      }
    };

    // Start with step 0 (Payment Processed)
    setCurrentStep(0);
    setProgress(33);
    confirmPayment();
  }, [payment_intent, navigate]);

  // Error State
  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 3
        }}
      >
        <Container maxWidth="md">
          <Fade in={!!error}>
            <Paper
              elevation={20}
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                  p: { xs: 3, sm: 4 },
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                <WarningIcon sx={{ fontSize: { xs: 48, sm: 56 }, mb: 2 }} />
                <Typography variant={isMobile ? "h4" : "h3"} fontWeight="700" gutterBottom>
                  Payment Confirmation Issue
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Don't worry! Your payment was likely successful
                </Typography>
              </Box>

              <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                {/* Main Alert */}
                <Alert
                  severity="warning"
                  icon={<InfoIcon />}
                  sx={{
                    mb: 4,
                    borderRadius: 2,
                    '& .MuiAlert-message': { width: '100%' }
                  }}
                >
                  <AlertTitle sx={{ fontWeight: 600, mb: 1 }}>
                    Technical Issue Detected
                  </AlertTitle>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    There's a technical issue with confirmation, but your payment was likely processed successfully.
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    Issue: {error}
                  </Typography>
                </Alert>

                {/* Debug Information */}
                <Card
                  variant="outlined"
                  sx={{
                    mb: 4,
                    borderRadius: 2,
                    bgcolor: 'grey.50'
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      Transaction Details
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="600">
                          PAYMENT INTENT ID
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            bgcolor: 'white',
                            p: 1,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'grey.200',
                            wordBreak: 'break-all'
                          }}
                        >
                          {payment_intent}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="600">
                          ATTEMPTS MADE
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={`${attempts} / ${maxAttempts} attempts`}
                            color={attempts >= maxAttempts ? "error" : "warning"}
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Recommended Actions */}
                <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
                  Recommended Actions
                </Typography>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent="center"
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<RefreshIcon />}
                    onClick={() => window.location.reload()}
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderRadius: 2,
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #45a049 30%, #3d8b40 90%)'
                      }
                    }}
                  >
                    Try Again
                  </Button>

                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingBagIcon />}
                    onClick={() => navigate("/orders")}
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderRadius: 2,
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)'
                      }
                    }}
                  >
                    Check Orders
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<SupportIcon />}
                    onClick={() => navigate("/contact")}
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderRadius: 2,
                      fontWeight: 600,
                      borderColor: 'grey.400',
                      color: 'grey.700',
                      '&:hover': {
                        borderColor: 'grey.600',
                        bgcolor: 'grey.50'
                      }
                    }}
                  >
                    Contact Support
                  </Button>
                </Stack>
              </CardContent>
            </Paper>
          </Fade>
        </Container>
      </Box>
    );
  }

  // Processing State
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
      <Container maxWidth="md">
        <Zoom in={isProcessing}>
          <Paper
            elevation={24}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              position: 'relative'
            }}
          >
            {/* Progress Bar */}
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 4,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #4CAF50, #8BC34A)'
                }
              }}
            />

            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                p: { xs: 3, sm: 4 },
                color: 'white',
                textAlign: 'center'
              }}
            >
              <Fade in timeout={1000}>
                <Box>
                  {currentStep === 2 ? (
                    <CheckCircleIcon sx={{ fontSize: { xs: 56, sm: 64 }, mb: 2 }} />
                  ) : (
                    <PaymentIcon sx={{ fontSize: { xs: 56, sm: 64 }, mb: 2 }} />
                  )}
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight="700" gutterBottom>
                    {currentStep === 2 ? "Booking Confirmed!" : "Confirming Your Payment"}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {currentStep === 2 
                      ? "Your booking has been successfully confirmed"
                      : "Please wait while we confirm your booking"
                    }
                  </Typography>
                </Box>
              </Fade>
            </Box>

            <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
              {/* Progress Stepper */}
              <Box sx={{ mb: 4 }}>
                <Stepper activeStep={currentStep} alternativeLabel={!isMobile}>
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel
                        StepIconComponent={({ active, completed }) => (
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: completed || active ? 'success.main' : 'grey.300',
                              color: 'white',
                              fontWeight: 600,
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {completed ? (
                              <CheckCircleIcon sx={{ fontSize: 20 }} />
                            ) : active ? (
                              <CircularProgress size={20} sx={{ color: 'white' }} />
                            ) : (
                              index + 1
                            )}
                          </Box>
                        )}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={index <= currentStep ? 600 : 400}
                          color={index <= currentStep ? 'text.primary' : 'text.secondary'}
                        >
                          {label}
                        </Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {/* Status Cards */}
              <Stack spacing={3}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: 'success.200',
                    bgcolor: 'success.50'
                  }}
                >
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <CheckCircleIcon color="success" sx={{ fontSize: 28 }} />
                      <Box>
                        <Typography variant="h6" fontWeight="600" color="success.dark">
                          Payment Processed Successfully
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Your payment has been securely processed
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: currentStep >= 1 ? 'primary.200' : 'grey.200',
                    bgcolor: currentStep >= 1 ? 'primary.50' : 'grey.50'
                  }}
                >
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      {currentStep >= 1 ? (
                        <CircularProgress size={28} />
                      ) : (
                        <ScheduleIcon color="disabled" sx={{ fontSize: 28 }} />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          fontWeight="600"
                          color={currentStep >= 1 ? 'primary.dark' : 'text.disabled'}
                        >
                          Confirming Your Booking
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {attempts > 0 && `Attempt ${attempts}/${maxAttempts} • `}
                          Finalizing your reservation details
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {currentStep === 2 && (
                  <Fade in timeout={1000}>
                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        border: '2px solid',
                        borderColor: 'success.200',
                        bgcolor: 'success.50'
                      }}
                    >
                      <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <BookOnlineIcon color="success" sx={{ fontSize: 28 }} />
                          <Box>
                            <Typography variant="h6" fontWeight="600" color="success.dark">
                              Booking Complete!
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Redirecting you to your orders...
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Fade>
                )}
              </Stack>

              {/* Footer Message */}
              {currentStep < 2 && (
                <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'grey.200' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Please don't close this page while we process your booking
                  </Typography>
                  <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                    <CircularProgress size={16} />
                    <Typography variant="caption" color="text.secondary">
                      Processing...
                    </Typography>
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Paper>
        </Zoom>
      </Container>
    </Box>
  );
};

export default Success;