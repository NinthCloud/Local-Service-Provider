import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import newRequest from "../../utils/newRequest";
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  Alert, 
  CircularProgress, 
  InputAdornment, 
  IconButton,
  Link,
  Divider
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Security, 
  Lock
} from '@mui/icons-material';

function PasswordReset() {
  const navigate = useNavigate();
  
  // States for different stages of password reset flow
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  
  // State for current step in the flow
  const [activeStep, setActiveStep] = useState(0); // 0: email, 1: security questions, 2: new password
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Password visibility state
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Function to find user by email
  const findUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Call the API to request password reset
      const response = await newRequest.post('/auth/password-reset/request', { email });
      setUserId(response.data.userId);
      
      // Fetch security questions for the user
      const questionsResponse = await newRequest.get(`/auth/password-reset/questions/${response.data.userId}`);
      setSecurityQuestions(questionsResponse.data.questions);
      
      // Initialize answers array with empty strings
      setAnswers(new Array(questionsResponse.data.questions.length).fill(''));
      
      // Move to security questions step
      setActiveStep(1);
      setSuccess('User found. Please answer the security questions.');
    } catch (error) {
      setError(error.response?.data?.message || 'Error finding user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle answer change
  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  // Function to verify security questions
  const verifySecurityQuestions = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Prepare answers in the format expected by the backend
      const formattedAnswers = securityQuestions.map((q, index) => ({
        questionId: q.questionId,
        question: q.question,
        answer: answers[index]
      }));
      
      // Call API to verify security questions
      const response = await newRequest.post('auth/password-reset/verify', {
        userId,
        answers: formattedAnswers
      });
      
      // Store reset token and move to password reset step
      setResetToken(response.data.resetToken);
      setActiveStep(2);
      setSuccess('Security questions verified. Please set your new password.');
    } catch (error) {
      setError(error.response?.data?.message || 'Error verifying security questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to reset password
  const resetPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    
    try {
      // Call API to reset password
      await newRequest.post('auth/password-reset/reset', {
        resetToken,
        newPassword
      });
      
      // Show success message and redirect to login after a short delay
      setSuccess('Password reset successful. Redirecting to login...');
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error resetting password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get step title based on current step
  const getStepTitle = () => {
    switch(activeStep) {
      case 0: return "Find Your Account";
      case 1: return "Security Verification";
      case 2: return "Create New Password";
      default: return "Password Reset";
    }
  };

  // Define step labels for stepper
  const steps = ['Email', 'Security Questions', 'New Password'];
  
  // Toggle password visibility
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f7fa',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={4} sx={{ overflow: 'hidden', borderRadius: 2 }}>
          {/* Header Section */}
          <Box 
            sx={{
              background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
              padding: 4,
              color: 'white',
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              {getStepTitle()}
            </Typography>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Box sx={{ padding: 4 }}>
            {/* Status Messages */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 3 }}
                variant="outlined"
              >
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert 
                severity="success" 
                sx={{ mb: 3 }}
                variant="outlined"
              >
                {success}
              </Alert>
            )}

            {/* Step 1: Email Input */}
            {activeStep === 0 && (
              <Box component="form" onSubmit={findUser} sx={{ mt: 1 }}>
                <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                  Please enter your email address to find your account.
                </Typography>
                
                <TextField
                  fullWidth
                  label="Email Address"
                  variant="outlined"
                  margin="normal"
                  required
                  autoFocus
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 2, mb: 2, py: 1.5 }}
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                  {loading ? 'Finding User...' : 'Continue'}
                </Button>
              </Box>
            )}
            
            {/* Step 2: Security Questions */}
            {activeStep === 1 && (
              <Box component="form" onSubmit={verifySecurityQuestions} sx={{ mt: 1 }}>
                <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                  Please answer all security questions below to verify your identity.
                </Typography>
                
                {securityQuestions.map((question, index) => (
                  <Box 
                    key={question.questionId} 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 1, 
                      bgcolor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                      {question.question}
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      required
                      value={answers[index] || ''}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      placeholder="Enter your answer"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Security fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                ))}
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 2, mb: 2, py: 1.5 }}
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                  {loading ? 'Verifying...' : 'Continue'}
                </Button>
              </Box>
            )}
            
            {/* Step 3: New Password */}
            {activeStep === 2 && (
              <Box component="form" onSubmit={resetPasswordSubmit} sx={{ mt: 1 }}>
                <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                  Choose a strong password that you haven't used before.
                </Typography>
                
                <TextField
                  fullWidth
                  label="New Password"
                  variant="outlined"
                  margin="normal"
                  required
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  inputProps={{ minLength: 6 }}
                  helperText="Password must be at least 6 characters"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={toggleNewPasswordVisibility}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Confirm Password"
                  variant="outlined"
                  margin="normal"
                  required
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  inputProps={{ minLength: 6 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={toggleConfirmPasswordVisibility}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 2, mb: 2, py: 1.5 }}
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </Button>
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            {/* Back to login link */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link 
                href="/login" 
                underline="hover" 
                color="primary"
                sx={{ fontWeight: 500 }}
              >
                Remember your password? Back to login
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default PasswordReset;