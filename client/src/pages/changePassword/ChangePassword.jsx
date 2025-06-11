import React, { useReducer, useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  Container,
  Alert,
  Fade,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Lock,
  CheckCircle,
} from "@mui/icons-material";
import newRequest from "../../utils/newRequest";
import getCurrentUser from "../../utils/getCurrentUser";
import { useNavigate } from "react-router-dom";
// import {
//   passwordReducer,
//   INITIAL_STATE,
//  } from "../../components/reducers/passwordReducer";

// Initial state for password change
export const INITIAL_STATE = {
  password: "",
  newPassword: "",
  confirmPassword: "",
};

export const passwordReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE_INPUT":
      return {
        ...state,
        [action.payload.name]: action.payload.value,
      };
    case "RESET_FORM":
      return INITIAL_STATE;
    case "SET_VALIDATION_ERROR":
      return {
        ...state,
        validationError: action.payload,
      };
    case "CLEAR_VALIDATION_ERROR":
      const { validationError, ...rest } = state;
      return rest;
    default:
      return state;
  }
};

const ChangePassword = () => {
  // Move navigate inside the component
  const navigate = useNavigate();
  
  // Use reducer to manage form state
  const [state, dispatch] = useReducer(passwordReducer, INITIAL_STATE);

  // UI state
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // Handle input changes using reducer
  const handleChange = (e) => {
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: e.target.name, value: e.target.value },
    });
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field],
    });
  };

  // Form validation
  const validateForm = () => {
    if (state.newPassword !== state.confirmPassword) {
      setError("New passwords do not match!");
      return false;
    }

    if (state.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    

    // Validate form
    if (!validateForm()) return;

    try {
      const currentUser = getCurrentUser();
      if (!currentUser || !currentUser.id) {
        setError("User not found. Please log in again.");
        return;
      }

      if (!currentUser) {
        setError("You must be logged in to change your password");
        return;
      }

      //console.log("Sending request to update password...");

      // Send request
      const response = await newRequest.put(
        `/users/${currentUser.id}/change-password`,
        {
          oldPassword: state.password,
          newPassword: state.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${currentUser.token}` }, // ✅ Ensure authentication
        }
      );
      //console.log("Response received:", response.data); // ✅ Log response

      setSuccess(true);
      setMessage(response.data.message || "Password updated successfully!");
      dispatch({ type: "RESET_FORM" });

      // Navigate to home page after a short delay
      setTimeout(() => {
        setSuccess(false);
        setMessage("");
        navigate("/"); // Navigate to home page
      }, 2000);
    } catch (err) {
      console.error("Error response:", err.response?.data);
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    }
  };

  return (
    <Box
      sx={{
        backgroundImage: "url('/img/auto.jpg')", // Change to your image path
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        },
      }}
    >
      <Container
        maxWidth="xs"
        sx={{
          position: "relative",
          zIndex: 2,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Paper
          elevation={4}
          sx={{
            padding: "30px",
            width: "100%",
            maxWidth: "400px",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={2}
          >
            <Lock sx={{ fontSize: 40, color: "#4F6F52" }} />
          </Box>

          <Typography
            fontWeight="700"
            textAlign="center"
            sx={{
              background: "linear-gradient(90deg, #1dbf73, #2196f3)",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "0.5px",
              fontSize: { xs: "1.5rem", sm: "2rem" },
            }}
          >
            Change Password
          </Typography>

          <Typography variant="body2" color="textSecondary" mb={3}>
            Ensure your account is secure by updating your password regularly.
          </Typography>

          {/* Alert messages */}
          {error && (
            <Fade in={Boolean(error)}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            </Fade>
          )}

          {success && (
            <Fade in={success}>
              <Alert
                severity="success"
                sx={{ mb: 2 }}
                icon={<CheckCircle fontSize="inherit" />}
              >
                {message}
              </Alert>
            </Fade>
          )}

          <form onSubmit={handleSubmit}>
            {/* Old Password */}
            <TextField
              fullWidth
              type={showPassword.old ? "text" : "password"}
              label="Old Password"
              name="password"
              variant="outlined"
              value={state.password}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility("old")}
                      edge="end"
                    >
                      {showPassword.old ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* New Password */}
            <TextField
              fullWidth
              type={showPassword.new ? "text" : "password"}
              label="New Password"
              name="newPassword"
              variant="outlined"
              value={state.newPassword}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility("new")}
                      edge="end"
                    >
                      {showPassword.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText="Password must be at least 6 characters long"
            />

            {/* Confirm New Password */}
            <TextField
              fullWidth
              type={showPassword.confirm ? "text" : "password"}
              label="Confirm New Password"
              name="confirmPassword"
              variant="outlined"
              value={state.confirmPassword}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility("confirm")}
                      edge="end"
                    >
                      {showPassword.confirm ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={
                state.newPassword !== state.confirmPassword &&
                state.confirmPassword !== ""
              }
              helperText={
                state.newPassword !== state.confirmPassword &&
                state.confirmPassword !== ""
                  ? "Passwords don't match"
                  : ""
              }
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{
                mt: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                background: "linear-gradient(90deg, #1dbf73, #2196f3)",
                boxShadow: "0 4px 15px rgba(29, 191, 115, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 6px 20px rgba(29, 191, 115, 0.4)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Update Password
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default ChangePassword;