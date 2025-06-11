import React, { useReducer, useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  CircularProgress,
  Avatar,
  Paper,
  Divider,
  useTheme,
  Fade,
  Stepper,
  Step,
  StepLabel,
  IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import upload from "../../utils/upload";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";
import getCurrentUser from "../../utils/getCurrentUser";
import {
  userReducer,
  INITIAL_STATE,
} from "../../components/reducers/userReducer";

const Profile = () => {
  const [imageFile, setImageFile] = useState(null);
  const [verifyFile, setVerifyFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [state, dispatch] = useReducer(userReducer, INITIAL_STATE);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({
    email: "",
    providerEmail: "",
    phone: "",
    providerPhone: "",
    experience: "",
    dob: "",
  });
  const theme = useTheme();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        const response = await newRequest.get(`/users/${currentUser.id}`);
        dispatch({ type: "SET_USER_INFO", payload: response.data });
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUser();
  }, [navigate]);

  // Validation for email inputs
  const validateEmail = (email, field) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setErrors((prev) => ({
        ...prev,
        [field]: "Enter a valid email address.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validation for phone inputs
  const validatePhone = (phone, field) => {
    const onlyNumbers = /^\d+$/; // Ensures only numeric characters
    const phoneRegex = /^[6-9]\d{9}$/; // Ensures 10-digit number starting with 6-9

    if (!onlyNumbers.test(phone)) {
      setErrors((prev) => ({
        ...prev,
        [field]: "Only numeric characters are allowed.",
      }));
    } else if (!phoneRegex.test(phone)) {
      setErrors((prev) => ({
        ...prev,
        [field]: "Enter a valid 10-digit phone number starting with 6-9.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // New validation function for experience
  const validateExperience = (experienceValue) => {
    if (!experienceValue || !state.dob) {
      // If either experience or DOB is missing, clear any existing error
      setErrors((prev) => ({ ...prev, experience: "" }));
      return;
    }

    // Extract numeric value from experience (assuming format like "5 years")
    const experienceYears = parseInt(
      experienceValue.replace(/[^0-9]/g, ""),
      10
    );

    if (isNaN(experienceYears)) {
      setErrors((prev) => ({
        ...prev,
        experience: "Please enter a valid number of years (e.g., '5 years').",
      }));
      return;
    }

    const birthDate = new Date(state.dob);
    const currentDate = new Date();

    // Calculate age
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // Earliest working age (14 years)
    const earliestWorkingAge = 14;

    // Calculate maximum possible experience
    const maxPossibleExperience = age - earliestWorkingAge;

    if (maxPossibleExperience < 0) {
      setErrors((prev) => ({
        ...prev,
        experience: `You must be at least ${earliestWorkingAge} years old to have work experience.`,
      }));
    } else if (experienceYears > maxPossibleExperience) {
      setErrors((prev) => ({
        ...prev,
        experience: `Experience cannot exceed ${maxPossibleExperience} years based on your age.`,
      }));
    } else {
      setErrors((prev) => ({ ...prev, experience: "" }));
    }
  };

  const validateDOB = (dateString) => {
    if (!dateString) {
      return;
    }

    const selectedDate = new Date(dateString);
    const currentDate = new Date();

    // Check if selected date is in the future
    if (selectedDate > currentDate) {
      setErrors((prev) => ({
        ...prev,
        dob: "Date of birth cannot be in the future.",
      }));
      return false;
    } else {
      setErrors((prev) => ({ ...prev, dob: "" }));
      return true;
    }
  };

  // Effect to validate experience when DOB changes
  useEffect(() => {
    if (state.experience && state.dob) {
      validateExperience(state.experience);
    }
  }, [state.dob]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // For DOB field, validate before updating state
    if (name === "dob") {
      const isValid = validateDOB(value);
      if (!isValid) {
        // Still update the UI to show the selected date, validation error will display
        dispatch({
          type: "CHANGE_INPUT",
          payload: { name, value },
        });
        return;
      }
    }

    dispatch({
      type: "CHANGE_INPUT",
      payload: { name, value },
    });

    // Validate experience when the experience field changes
    if (name === "experience") {
      validateExperience(value);
    }
  };

  const handleSeller = () => {
    dispatch({ type: "TOGGLE_SELLER_STATUS" });
  };

  const handleUpload = async (type) => {
    const fileToUpload = type === "image" ? imageFile : verifyFile;

    if (!fileToUpload) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const url = await upload(fileToUpload);
      setUploading(false);
      if (type === "image") {
        dispatch({ type: "ADD_IMAGE", payload: url });
        setImageFile(null); // Clear only the image file
      } else if (type === "verify") {
        dispatch({ type: "ADD_VERIFY", payload: url });
        setVerifyFile(null); // Clear only the verify file
      }
    } catch (err) {
      setUploading(false);
      setError("Error uploading file. Please try again.");
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (state.dob) {
      validateDOB(state.dob);
    }

    // Validate experience again before submission
    if (state.experience && state.dob) {
      validateExperience(state.experience);
    }

    // Check if there are any validation errors
    if (Object.values(errors).some((error) => error !== "")) {
      setError("Please fix the errors before submitting.");
      return;
    }

    try {
      const currentUser = getCurrentUser();
      const { id, password, ...updatedData } = state;
      delete updatedData.password;

      if (password && password.trim() !== "") {
        updatedData.password = password;
      }

      await newRequest.put(`/users/${currentUser.id}`, updatedData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate("/profile");
      }, 2000);
    } catch (err) {
      setError(
        "An error occurred while updating the profile. Please try again."
      );
      console.error(err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: "#fff",
          position: "relative",
        }}
      >
        {/* Header section */}
        <Box
          sx={{
            bgcolor: theme.palette.primary.main,
            color: "white",
            p: 3,
            position: "relative",
          }}
        >
          <IconButton
            sx={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              color: "white",
            }}
            onClick={() => navigate("/profile")}
          >
            <ArrowBackIcon />
          </IconButton>

          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Edit Your Profile
          </Typography>
        </Box>

        {/* Alert messages */}
        <Box sx={{ px: 3, pt: 2 }}>
          {success && (
            <Fade in={success}>
              <Alert
                severity="success"
                sx={{ mb: 2 }}
                icon={<CheckCircleIcon fontSize="inherit" />}
              >
                Profile updated successfully!
              </Alert>
            </Fade>
          )}

          {error && (
            <Fade in={Boolean(error)}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            </Fade>
          )}
        </Box>

        {/* Stepper for progress indication */}
        <Box sx={{ p: 3, display: { xs: "none", md: "block" } }}>
          <Stepper activeStep={1} alternativeLabel>
            <Step completed>
              <StepLabel>View Profile</StepLabel>
            </Step>
            <Step active>
              <StepLabel>Edit Profile</StepLabel>
            </Step>
            <Step>
              <StepLabel>Profile Updated</StepLabel>
            </Step>
          </Stepper>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={4}>
              {/* LEFT SIDE - Personal Information */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <PersonIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h5" fontWeight="500">
                      Personal Information
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  {/* Profile Picture Section */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      mb: 4,
                      position: "relative",
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        mb: 2,
                        width: 120,
                        height: 120,
                      }}
                    >
                      <Avatar
                        src={state.image || "/assets/default-avatar.png"}
                        alt={state.username}
                        sx={{
                          width: 120,
                          height: 120,
                          border: "4px solid white",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                        }}
                      />
                      <IconButton
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          bgcolor: theme.palette.primary.main,
                          color: "white",
                          "&:hover": {
                            bgcolor: theme.palette.primary.dark,
                          },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>

                    <Box sx={{ display: "flex", width: "100%", gap: 1 }}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        sx={{
                          flexGrow: 1,
                          borderRadius: 2,
                          py: 1,
                        }}
                        disabled={uploading}
                      >
                        Select Image
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files.length > 1) {
                              setError("You can only upload one file.");
                              return;
                            }
                            if (e.target.files[0].size > 250 * 1024) {
                              setError("File size must be less than 250kb.");
                              return;
                            }
                            setImageFile(e.target.files[0]);
                          }}
                        />
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleUpload("image")}
                        disabled={!imageFile || uploading}
                        sx={{
                          flexGrow: 1,
                          borderRadius: 2,
                          py: 1,
                        }}
                      >
                        {uploading ? <CircularProgress size={24} /> : "Upload"}
                      </Button>
                    </Box>
                    {imageFile && (
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, color: "text.secondary" }}
                      >
                        Selected: {imageFile.name}
                      </Typography>
                    )}
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={state.username || ""}
                        onChange={handleChange}
                        required
                        inputProps={{ minLength: 3, maxLength: 20 }}
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="fullName"
                        value={state.fullName || ""}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ mb: 2 }}
                        inputProps={{ maxLength: 255 }}
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={state.email || ""}
                        onChange={handleChange}
                        onBlur={(e) => validateEmail(e.target.value, "email")}
                        required
                        variant="outlined"
                        sx={{ mb: 2 }}
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        type="tel"
                        value={state.phone || ""}
                        onChange={handleChange}
                        onBlur={(e) => validatePhone(e.target.value, "phone")}
                        onInput={(e) => {
                          e.target.value = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          );
                        }}
                        required
                        variant="outlined"
                        sx={{ mb: 2 }}
                        inputProps={{ maxLength: 10 }}
                        error={Boolean(errors.phone)}
                        helperText={errors.phone}
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address"
                        name="address"
                        value={state.address || ""}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ mb: 2 }}
                        inputProps={{ maxLength: 255 }}
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Pincode"
                        name="pincode"
                        type="number"
                        value={state.pincode || ""}
                        onChange={handleChange}
                        inputProps={{
                          inputMode: "numeric", // Ensures numeric keyboard on mobile
                          pattern: "[0-9]{6}", // Enforces six digits
                          maxLength: 6, // Prevents more than six digits
                        }}
                        onInput={(e) => {
                          e.target.value = e.target.value
                            .replace(/[^0-9]/g, "")
                            .slice(0, 6);
                        }}
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <TextField
                        fullWidth
                        label="City"
                        name="city"
                        value={state.city || ""}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ mb: 2 }}
                        inputProps={{ maxLength: 255 }}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    label="About you"
                    name="desc2"
                    fullWidth
                    multiline
                    rows={3}
                    value={state.desc2 || ""}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{ mb: 2 }}
                    inputProps={{ maxLength: 255 }}
                  />
                </Box>
              </Grid>

              {/* RIGHT SIDE - Provider Information */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <BusinessIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h5" fontWeight="500">
                      Provider Information
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={state.isSeller}
                        onChange={handleSeller}
                        color="primary"
                      />
                    }
                    label={
                      <Typography
                        variant="body1"
                        fontWeight="500"
                        color={
                          state.isSeller && state.approvedByAdmin
                            ? "primary"
                            : "text.secondary"
                        }
                      >
                        {state.isSeller && state.approvedByAdmin
                          ? "You are a Provider"
                          : "Apply for Provider"}
                      </Typography>
                    }
                    sx={{ mb: 3 }}
                  />

                  {state.isSeller ? (
                    <Fade in={state.isSeller}>
                      <Box>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Business Name"
                              name="providerName"
                              value={state.providerName || ""}
                              onChange={handleChange}
                              variant="outlined"
                              sx={{ mb: 2 }}
                              inputProps={{ maxLength: 255 }}
                            />
                          </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Business Email"
                              name="providerEmail"
                              type="email"
                              value={state.providerEmail || ""}
                              onChange={handleChange}
                              onBlur={(e) =>
                                validateEmail(e.target.value, "providerEmail")
                              }
                              variant="outlined"
                              sx={{ mb: 2 }}
                              error={Boolean(errors.providerEmail)}
                              helperText={errors.providerEmail}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Business Phone"
                              name="providerPhone"
                              type="tel"
                              value={state.providerPhone || ""}
                              onChange={handleChange}
                              onBlur={(e) =>
                                validatePhone(e.target.value, "providerPhone")
                              }
                              onInput={(e) => {
                                e.target.value = e.target.value.replace(
                                  /[^0-9]/g,
                                  ""
                                );
                              }}
                              variant="outlined"
                              sx={{ mb: 2 }}
                              inputProps={{ maxLength: 10 }}
                              error={Boolean(errors.providerPhone)}
                              helperText={errors.providerPhone}
                            />
                          </Grid>
                        </Grid>

                        <TextField
                          fullWidth
                          label="Business Address"
                          name="providerAddress"
                          value={state.providerAddress || ""}
                          onChange={handleChange}
                          variant="outlined"
                          sx={{ mb: 2 }}
                          inputProps={{ maxLength: 255 }}
                        />
                        <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date of Birth"
                        name="dob"
                        type="date"
                        value={
                          state.dob
                            ? new Date(state.dob).toISOString().split("T")[0]
                            : ""
                        }
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                        // Add max date attribute to prevent future date selection
                        inputProps={{
                          max: new Date().toISOString().split("T")[0],
                        }}
                        error={Boolean(errors.dob)}
                        helperText={errors.dob}
                      />
                    </Grid>

                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Select
                              fullWidth
                              name="serviceLevel"
                              value={state.serviceLevel || ""}
                              onChange={handleChange}
                              displayEmpty
                              variant="outlined"
                              sx={{ mb: 2 }}
                            >
                              <MenuItem value="">
                                Select a Service Level
                              </MenuItem>
                              <MenuItem value="Individual">Individual</MenuItem>
                              <MenuItem value="Organisation">
                                Organisation
                              </MenuItem>
                            </Select>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Service hours"
                              name="serviceHours"
                              value={state.serviceHours || ""}
                              onChange={handleChange}
                              variant="outlined"
                              sx={{ mb: 2 }}
                              inputProps={{ maxLength: 255 }}
                              placeholder="e.g., 9:00 AM - 5:00 PM"
                            />
                          </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Profession"
                              name="profession"
                              value={state.profession || ""}
                              onChange={handleChange}
                              variant="outlined"
                              sx={{ mb: 2 }}
                              inputProps={{ maxLength: 255 }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Experience"
                              name="experience"
                              value={state.experience || ""}
                              onChange={handleChange}
                              onBlur={(e) => validateExperience(e.target.value)}
                              variant="outlined"
                              sx={{ mb: 2 }}
                              error={Boolean(errors.experience)}
                              helperText={errors.experience}
                              inputProps={{ maxLength: 255 }}
                              placeholder="e.g., 5 years"
                            />
                          </Grid>
                        </Grid>

                        <TextField
                          label="About your service"
                          name="desc"
                          fullWidth
                          multiline
                          rows={4}
                          value={state.desc || ""}
                          onChange={handleChange}
                          variant="outlined"
                          sx={{ mb: 3 }}
                          inputProps={{ maxLength: 255 }}
                        />

                        {/* Verification Document Upload */}
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Verification Document
                        </Typography>

                        <Box
                          sx={{
                            border: "1px dashed",
                            borderColor: "divider",
                            borderRadius: 2,
                            p: 3,
                            mb: 3,
                            textAlign: "center",
                            backgroundColor: "background.paper",
                          }}
                        >
                          {state.verify ? (
                            <Box sx={{ textAlign: "center" }}>
                              <Avatar
                                src={state.verify}
                                sx={{
                                  width: 100,
                                  height: 100,
                                  mb: 2,
                                  mx: "auto",
                                }}
                              />
                              <Typography
                                variant="body2"
                                color="success.main"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <CheckCircleIcon
                                  sx={{ mr: 0.5 }}
                                  fontSize="small"
                                />
                                Document uploaded successfully
                              </Typography>
                            </Box>
                          ) : (
                            <>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                              >
                                Upload a document for verification (ID/License)
                              </Typography>

                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  justifyContent: "center",
                                }}
                              >
                                <Button
                                  variant="outlined"
                                  component="label"
                                  startIcon={<CloudUploadIcon />}
                                  sx={{ borderRadius: 2 }}
                                  disabled={uploading}
                                >
                                  Select Document
                                  <input
                                    type="file"
                                    hidden
                                    accept="application/pdf,image/*"
                                    onChange={(e) => {
                                      if (state.verify) {
                                        setError(
                                          "A verification document is already uploaded."
                                        );
                                        return;
                                      }
                                      if (e.target.files.length > 1) {
                                        setError(
                                          "You can only upload one file."
                                        );
                                        return;
                                      }
                                      if (e.target.files[0].size > 250 * 1024) {
                                        setError(
                                          "File size must be less than 250kb."
                                        );
                                        return;
                                      }
                                      setVerifyFile(e.target.files[0]);
                                    }}
                                  />
                                </Button>

                                <Button
                                  variant="contained"
                                  onClick={() => handleUpload("verify")}
                                  disabled={!verifyFile || uploading}
                                  sx={{ borderRadius: 2 }}
                                >
                                  {uploading ? (
                                    <CircularProgress size={24} />
                                  ) : (
                                    "Upload"
                                  )}
                                </Button>
                              </Box>

                              {verifyFile && (
                                <Typography
                                  variant="body2"
                                  sx={{ mt: 1, color: "text.secondary" }}
                                >
                                  Selected: {verifyFile.name}
                                </Typography>
                              )}
                            </>
                          )}
                        </Box>
                      </Box>
                    </Fade>
                  ) : (
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 8,
                        opacity: 0.7,
                      }}
                    >
                      <Typography variant="body1" color="text.secondary">
                        Turn on the switch above to enable provider features
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{
                mt: 4,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                fontWeight: "bold",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
                },
              }}
            >
              Update Profile
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Profile;
