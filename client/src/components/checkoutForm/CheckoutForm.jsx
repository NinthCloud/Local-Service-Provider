
import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Box,
  Button,
  Typography,
  Alert,
  AlertTitle,
  Paper,
  Divider,
  Stack,
  Chip,
  CircularProgress,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  LinearProgress,
  Backdrop,
  Dialog,
  DialogContent,
  Tooltip,
  IconButton,
  Collapse,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepIcon,
} from "@mui/material";
import {
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassIcon,
  CreditCard as CreditCardIcon,
  Security as SecurityIcon,
  Send as SendIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Shield as ShieldIcon,
  Verified as VerifiedIcon,
  Info as InfoIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from "@mui/icons-material";

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);

  const steps = ['Email Verification', 'Payment Details', 'Secure Checkout'];

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          setPaymentStatus("success");
          setActiveStep(2);
          break;
        case "processing":
          setMessage("Your payment is processing.");
          setPaymentStatus("processing");
          setActiveStep(2);
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          setPaymentStatus("error");
          break;
        default:
          setMessage("Something went wrong.");
          setPaymentStatus("error");
          break;
      }
    });
  }, [stripe]);

  useEffect(() => {
    if (email) {
      setEmailVerified(true);
      setActiveStep(1);
    }
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setActiveStep(2);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:5173/success",
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
      setPaymentStatus("error");
    } else {
      setMessage("An unexpected error occurred.");
      setPaymentStatus("error");
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs",
    variables: {
      colorPrimary: theme.palette.primary.main,
      colorBackground: theme.palette.background.paper,
      colorText: theme.palette.text.primary,
      colorDanger: theme.palette.error.main,
      fontFamily: theme.typography.fontFamily,
      spacingUnit: '4px',
      borderRadius: '12px',
    },
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircleIcon sx={{ color: "success.main", fontSize: 24 }} />;
      case "processing":
        return <HourglassIcon sx={{ color: "warning.main", fontSize: 24 }} />;
      case "error":
        return <ErrorIcon sx={{ color: "error.main", fontSize: 24 }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "success";
      case "processing":
        return "warning";
      case "error":
        return "error";
      default:
        return "info";
    }
  };

  const CustomStepIcon = (props) => {
    const { active, completed, icon } = props;
    
    const icons = {
      1: <EmailIcon />,
      2: <CreditCardIcon />,
      3: <SecurityIcon />,
    };

    return (
      <Avatar
        sx={{
          bgcolor: completed ? 'success.main' : active ? 'primary.main' : 'grey.300',
          width: 40,
          height: 40,
          fontSize: '1.2rem',
          boxShadow: active || completed ? 3 : 1,
          transition: 'all 0.3s ease',
        }}
      >
        {completed ? <CheckCircleOutlineIcon /> : icons[String(icon)]}
      </Avatar>
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Stack spacing={4}>
        {/* Progress Stepper */}
        <Card
          elevation={0}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.secondary.main}08)`,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stepper
              activeStep={activeStep}
              alternativeLabel={!isMobile}
              orientation={isMobile ? 'vertical' : 'horizontal'}
              sx={{
                '& .MuiStepLabel-label': {
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 600,
                },
              }}
            >
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel StepIconComponent={CustomStepIcon}>
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Payment Status Message */}
        <Collapse in={!!message}>
          <Alert
            severity={getStatusColor(paymentStatus)}
            icon={getStatusIcon(paymentStatus)}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette[getStatusColor(paymentStatus)]?.light}`,
              background: `linear-gradient(135deg, ${theme.palette[getStatusColor(paymentStatus)]?.light}15, ${theme.palette[getStatusColor(paymentStatus)]?.main}05)`,
              '& .MuiAlert-message': {
                width: '100%'
              },
              '& .MuiAlert-icon': {
                fontSize: 28
              }
            }}
          >
            <AlertTitle sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
              {paymentStatus === "success" && "🎉 Payment Successful!"}
              {paymentStatus === "processing" && "⏳ Payment Processing"}
              {paymentStatus === "error" && "❌ Payment Issue"}
              {!paymentStatus && "💳 Payment Status"}
            </AlertTitle>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {message}
            </Typography>
          </Alert>
        </Collapse>

        {/* Email Authentication Section */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `2px solid ${emailVerified ? theme.palette.success.light : theme.palette.primary.light}`,
            background: emailVerified 
              ? `linear-gradient(135deg, ${theme.palette.success.light}15, ${theme.palette.success.main}05)`
              : `linear-gradient(135deg, ${theme.palette.primary.light}15, ${theme.palette.primary.main}05)`,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: emailVerified 
                ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
                : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
            transition: 'all 0.3s ease',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Avatar
                sx={{
                  bgcolor: emailVerified ? 'success.main' : 'primary.main',
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  boxShadow: 3,
                }}
              >
                {emailVerified ? <VerifiedIcon sx={{ fontSize: 28 }} /> : <EmailIcon sx={{ fontSize: 28 }} />}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="700" color={emailVerified ? "success.dark" : "primary.dark"}>
                  Email Verification
                  {emailVerified && (
                    <Chip
                      label="Verified"
                      size="small"
                      color="success"
                      sx={{ ml: 1, fontWeight: 600 }}
                    />
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {emailVerified 
                    ? "✅ Email verified successfully" 
                    : "We'll send payment confirmations to this email"
                  }
                </Typography>
              </Box>
            </Stack>
            
            <Box
              sx={{
                position: 'relative',
                '& #link-authentication-element': {
                  padding: '20px',
                  borderRadius: '12px',
                  border: `2px solid ${emailVerified ? theme.palette.success.light : theme.palette.grey[300]}`,
                  backgroundColor: 'white',
                  transition: 'all 0.3s ease',
                  boxShadow: emailVerified ? `0 4px 20px ${theme.palette.success.main}20` : 'none',
                  '&:hover': {
                    borderColor: emailVerified ? theme.palette.success.main : theme.palette.primary.main,
                    boxShadow: `0 4px 20px ${emailVerified ? theme.palette.success.main : theme.palette.primary.main}20`
                  },
                  '&:focus-within': {
                    borderColor: emailVerified ? theme.palette.success.main : theme.palette.primary.main,
                    boxShadow: `0 0 0 4px ${emailVerified ? theme.palette.success.main : theme.palette.primary.main}15`
                  }
                }
              }}
            >
              <LinkAuthenticationElement
                id="link-authentication-element"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Box>
          </CardContent>
        </Card>

        <Divider sx={{ my: 2 }}>
          <Chip
            icon={<CreditCardIcon />}
            label="💳 Payment Details"
            color="primary"
            variant="filled"
            sx={{ 
              px: 3, 
              py: 1,
              fontWeight: 700,
              fontSize: '1rem',
              borderRadius: 3,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: 3,
            }}
          />
        </Divider>

        {/* Payment Element Section */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `2px solid ${theme.palette.grey[200]}`,
            background: `linear-gradient(135deg, ${theme.palette.grey[50]}, ${theme.palette.background.paper})`,
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 8px 32px ${theme.palette.primary.main}15`,
            },
            transition: 'all 0.3s ease'
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                    boxShadow: 3,
                  }}
                >
                  <PaymentIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="700" color="primary.dark">
                    Choose Payment Method
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    🔒 All transactions are secured with industry-standard encryption
                  </Typography>
                </Box>
              </Stack>
              
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: 'white',
                  border: `1px solid ${theme.palette.grey[200]}`,
                  boxShadow: `0 2px 12px ${theme.palette.grey[200]}`,
                  '& #payment-element': {
                    '& .p-TabsItem': {
                      borderRadius: '12px 12px 0 0',
                      fontWeight: 600,
                    },
                    '& .p-Input, & .p-Input--empty': {
                      borderRadius: '12px',
                      border: '2px solid #e0e0e0',
                      padding: '18px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 2px 8px ${theme.palette.primary.main}20`
                      },
                      '&:focus': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 0 4px ${theme.palette.primary.main}15`
                      }
                    },
                    '& .p-Tabs': {
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }
                  }
                }}
              >
                <PaymentElement id="payment-element" options={paymentElementOptions} />
              </Box>

              {/* Trust Indicators */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                justifyContent="center"
                alignItems="center"
              >
                <Chip
                  icon={<ShieldIcon />}
                  label="PCI DSS Compliant"
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderColor: 'success.main', 
                    color: 'success.main',
                    fontWeight: 600,
                  }}
                />
                <Chip
                  icon={<LockIcon />}
                  label="256-bit SSL"
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderColor: 'info.main', 
                    color: 'info.main',
                    fontWeight: 600,
                  }}
                />
                <Chip
                  icon={<VerifiedIcon />}
                  label="Stripe Verified"
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderColor: 'primary.main', 
                    color: 'primary.main',
                    fontWeight: 600,
                  }}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Box sx={{ position: 'relative' }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isLoading || !stripe || !elements}
            startIcon={
              isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <SendIcon />
              )
            }
            sx={{
              py: { xs: 2, sm: 2.5 },
              fontSize: { xs: '1.1rem', sm: '1.2rem' },
              fontWeight: 700,
              borderRadius: 3,
              textTransform: 'none',
              background: isLoading 
                ? 'linear-gradient(45deg, #ccc 30%, #999 90%)'
                : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: isLoading 
                ? 'none'
                : '0 8px 32px rgba(33, 203, 243, .4)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                transition: 'left 0.5s',
              },
              '&:hover': {
                background: isLoading 
                  ? 'linear-gradient(45deg, #ccc 30%, #999 90%)'
                  : 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                boxShadow: isLoading 
                  ? 'none'
                  : '0 12px 40px rgba(33, 203, 243, .5)',
                transform: isLoading ? 'none' : 'translateY(-2px)',
                '&::before': {
                  left: '100%',
                }
              },
              '&:disabled': {
                background: 'linear-gradient(45deg, #ccc 30%, #999 90%)',
                color: 'white'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? (
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="inherit" sx={{ fontWeight: 700 }}>
                  🔄 Processing Payment...
                </Typography>
              </Stack>
            ) : (
              <Typography variant="inherit" sx={{ fontWeight: 700 }}>
                🚀 Complete Secure Payment
              </Typography>
            )}
          </Button>

          {/* Loading Progress */}
          {isLoading && (
            <LinearProgress
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                borderRadius: '0 0 12px 12px',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
                }
              }}
            />
          )}
        </Box>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backdropFilter: 'blur(10px)',
            background: 'rgba(0,0,0,0.3)',
          }}
          open={isLoading}
        >
          <Card
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 4,
              textAlign: 'center',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.primary.light}`,
              minWidth: { xs: 280, sm: 350 },
            }}
          >
            <Stack spacing={3} alignItems="center">
              <Box sx={{ position: 'relative' }}>
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
                <Avatar
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'primary.main',
                    width: 32,
                    height: 32,
                  }}
                >
                  <SecurityIcon sx={{ fontSize: 20 }} />
                </Avatar>
              </Box>
              
              <Box>
                <Typography variant="h6" color="primary.dark" fontWeight="700" gutterBottom>
                  🔐 Securing Your Payment
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please don't close this window while we process your payment securely.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                <Chip
                  icon={<ShieldIcon />}
                  label="Encrypted"
                  size="small"
                  color="success"
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  icon={<LockIcon />}
                  label="Secure"
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
            </Stack>
          </Card>
        </Backdrop>

        {/* Enhanced Security Footer */}
        <Card
          elevation={0}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.success.light}15, ${theme.palette.success.main}05)`,
            border: `1px solid ${theme.palette.success.light}`,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
            }
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={3}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                alignItems="center"
                justifyContent="center"
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                    <SecurityIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" color="success.dark" fontWeight="700">
                      🛡️ Bank-Level Security
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your data is fully encrypted and protected
                    </Typography>
                  </Box>
                </Stack>
                
                <Tooltip title="Learn more about our security measures">
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: 'info.light',
                      color: 'info.main',
                      '&:hover': { bgcolor: 'info.main', color: 'white' }
                    }}
                  >
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Stack>

              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                justifyContent="center"
                alignItems="center"
                divider={<Divider orientation="vertical" flexItem />}
              >
                <Typography variant="body2" color="text.secondary" fontWeight="600">
                  🔒 256-bit SSL Encryption
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="600">
                  🏦 PCI DSS Level 1 Certified
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="600">
                  ⚡ Powered by Stripe
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default CheckoutForm;