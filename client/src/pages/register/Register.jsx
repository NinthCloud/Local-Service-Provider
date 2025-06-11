import React, { useState } from "react";
import {
  Button,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
  Avatar,
  Box,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import upload from "../../utils/upload";
import newRequest from "../../utils/newRequest";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SecurityIcon from "@mui/icons-material/Security";

const MAX_FILE_SIZE = 250 * 1024; // 50KB

const Register = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Add this array of security questions
  const securityQuestions = [
    "What was your childhood nickname?",
    "What is the name of your first pet?",
    "What was the model of your first car?",
    "In what city were you born?",
    "What was the name of your childhood best friend?",
    "What is your mother's maiden name?",
    "What was the name of your first school?",
    "What is your favorite movie?",
    "What street did you grow up on?",
    "What was your favorite place to visit as a child?",
  ];

  const [file, setFile] = useState(null);
  const [verifyFile, setVerifyFile] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [verifyImageUrl, setVerifyImageUrl] = useState("");
  const [errors, setErrors] = useState({ email: "", providerEmail: "" });
  const [errorNum, setErrorNum] = useState({ phone: "", providerPhone: "" });
  const [error, setError] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [experienceError, setExperienceError] = useState("");
  const [dobError, setDobError] = useState("");

  const [user, setUser] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    image: "",
    city: "",
    address: "",
    pincode: "",
    phone: "",
    dob: "",
    profession: "",
    desc: "",
    desc2: "",
    isSeller: false,
    appliedForProvider: false,
    serviceLevel: "",
    experience: "",
    serviceHours: "",
    providerName: "",
    providerEmail: "",
    providerAddress: "",
    providerPhone: "",
    verify: "",
  });

  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  // Calculate date 18 years ago for minimum age validation
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  const minAgeDate = eighteenYearsAgo.toISOString().split("T")[0];

  // Function to validate DOB
  const validateDob = (dob) => {
    if (!dob) return "Date of birth is required";

    const dobDate = new Date(dob);
    const currentDate = new Date();

    // Check if date is valid
    if (isNaN(dobDate.getTime())) return "Invalid date format";

    // Check if date is in the future
    if (dobDate > currentDate) return "Date of birth cannot be in the future";

    // Calculate age
    let age = currentDate.getFullYear() - dobDate.getFullYear();
    const m = currentDate.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && currentDate.getDate() < dobDate.getDate())) {
      age--;
    }

    // Check if at least 18 years old
    if (age < 14)
      return "You must be at least 18 years old to register as a provider";

    return "";
  };

  // Then add a function to validate experience based on date of birth
  // Function to extract the number of years from experience string
  const extractExperienceYears = (exp) => {
    if (!exp) return null;

    // Try to extract number from string (e.g., "5 years" → 5)
    const matches = exp.match(/^(\d+)/);
    if (matches && matches[1]) {
      return parseInt(matches[1], 10);
    }
    return null;
  };

  // Update validation function
  const validateExperience = (experience, dob) => {
    if (!dob) return "Please enter your date of birth first";
    if (!experience) return "";

    const dobError = validateDob(dob);
    if (dobError) return "Please fix issues with your date of birth first";

    // Extract years from experience
    const expYears = extractExperienceYears(experience);
    if (expYears === null)
      return "Please enter a valid number of years (e.g. '5 years')";

    const birthDate = new Date(dob);
    const today = new Date();

    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // Calculate max possible experience (age - 14)
    const maxPossibleExperience = age - 14;

    if (expYears < 0) return "Experience years cannot be negative";
    if (expYears > maxPossibleExperience) {
      return `Experience cannot exceed ${maxPossibleExperience} years based on your birth date`;
    }

    return "";
  };

  const validateEmail = (email, field) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setErrors((prev) => ({
        ...prev,
        [field]: "Please enter a valid email address.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validatePhone = (phone, field) => {
    const onlyNumbers = /^\d+$/; // Ensures only numeric characters
    const phoneRegex = /^[6-9]\d{9}$/; // Ensures 10-digit number starting with 6-9

    if (!onlyNumbers.test(phone)) {
      setErrorNum((prev) => ({
        ...prev,
        [field]: "Only numeric characters are allowed.",
      }));
    } else if (!phoneRegex.test(phone)) {
      setErrorNum((prev) => ({
        ...prev,
        [field]: "Enter a valid 10-digit phone number starting with 6-9.",
      }));
    } else {
      setErrorNum((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Modify the handleChange function to validate experience when either dob or experience changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setUser((prev) => {
      const updatedUser = { ...prev, [name]: value };

      // If DOB changed, validate it
      if (name === "dob") {
        const dobValidationError = validateDob(value);
        setDobError(dobValidationError);

        // If experience is already entered, validate it again with new DOB
        if (updatedUser.experience) {
          const expValidationError = validateExperience(
            updatedUser.experience,
            value
          );
          setExperienceError(expValidationError);
        }
      }

      // If experience changed, validate it
      if (name === "experience") {
        const expValidationError = validateExperience(value, updatedUser.dob);
        setExperienceError(expValidationError);
      }

      return updatedUser;
    });
  };

  const handleBlur = () => {
    if (user.password.length > 0 && user.password.length < 6) {
      alert("Password must be at least 6 characters long");
    }
  };

  const handleSellerToggle = (e) => {
    setUser((prev) => ({ ...prev, isSeller: e.target.checked }));
  };

  const handleFileChange = (e, setFileState) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError("File size must be less than 50KB.");
        setFileState(null);
      } else {
        setError("");
        setFileState(selectedFile);
      }
    }
  };

  const handleUpload = async (file, setImageUrl) => {
    if (!file) {
      setError("Please select a file before uploading.");
      return;
    }

    try {
      const uploadedUrl = await upload(file);
      setImageUrl(uploadedUrl);
      setError("");
    } catch (err) {
      setError("Upload failed. Please try again.");
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


  // Validate DOB and experience before submission
  if (user.isSeller) {
    const dobValidationError = validateDob(user.dob);
    if (dobValidationError) {
      setDobError(dobValidationError);
      setError("Please fix the issues with your date of birth.");
      return;
    }
    
    if (user.experience) {
      const expValidationError = validateExperience(user.experience, user.dob);
      if (expValidationError) {
        setExperienceError(expValidationError);
        setError("Please fix the issues with your experience.");
        return;
      }
    }
  }

    if (
      !user.username ||
      !user.email ||
      !user.password ||
      !user.phone ||
      !user.securityQA ||
      !user.address ||
      user.securityQA.length < 3 || // Check that all 3 questions are set
      user.securityQA.some((q) => !q.question || !q.answer) // Check all questions have answers
    ) {
      setError("Please fill all required fields including security questions.");
      return;
    }

    if (
      user.isSeller &&
      (!user.providerName ||
        !user.providerAddress ||
        !user.providerEmail ||
        !user.providerPhone ||
        !user.dob ||
        !verifyFile)
    ) {
      setError("Please fill all provider-specific fields.");
      return;
    }

    setError("");

    const profileImageUrl = file ? await upload(file) : "";
    const verifyImageUrl = verifyFile ? await upload(verifyFile) : "";

    try {
      await newRequest.post("/auth/register", {
        ...user,
        image: profileImageUrl,
        verify: verifyImageUrl,
        appliedForProvider: user.isSeller ? true : false,
      });
      navigate("/login");
    } catch (err) {
      setError("An error occurred while registering. Please try again.");
      console.log(err);
    }
  };

  const steps = [
    "Basic Information",
    "Additional Details",
    user.isSeller ? "Provider Information" : "Finalize",
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 4,
          background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            fontWeight="700"
            align="center"
            mb={1}
            color="primary"
          >
            Create Your Account
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ maxWidth: "600px" }}
          >
            Join our community and unlock all features. Fill in your details
            below to get started. Fields marked * are required for successfull
            registration
          </Typography>
        </Box>

        <Box sx={{ width: "100%", mb: 4 }}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel={!isMobile}
            orientation={isMobile ? "vertical" : "horizontal"}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <form onSubmit={handleSubmit}>
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Username"
                  name="username"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  required
                  inputProps={{ minLength: 3, maxLength: 20 }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Full Name"
                  name="fullName"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  onBlur={(e) => validateEmail(e.target.value, "email")}
                  required
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  onBlur={(e) => validatePhone(e.target.value, "phone")}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                  }}
                  required
                  inputProps={{ maxLength: 10 }}
                  error={Boolean(errorNum.phone)}
                  helperText={errorNum.phone}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Address"
                  name="address"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Pincode"
                  name="pincode"
                  type="number" // Keep as text to fully control input behavior
                  variant="outlined"
                  fullWidth
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
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "flex-end" }}
              >
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    px: 3,
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  Continue
                </Button>
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="City"
                  name="city"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="About you"
                  name="desc2"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                {/* user password reset questions*/}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    <SecurityIcon
                      color="primary"
                      sx={{ mr: 1, verticalAlign: "middle" }}
                    />
                    Security Questions
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Please select at least 3 security questions and provide
                    answers to help recover your account if you forget your
                    password.
                  </Typography>

                  {/* Question 1 */}
                  <FormControl fullWidth required sx={{ mb: 2 }}>
                    <InputLabel>Security Question 1</InputLabel>
                    <Select
                      name="securityQuestion1"
                      value={
                        user.securityQA?.find((q) => q.id === 1)?.question || ""
                      }
                      onChange={(e) => {
                        const selectedQuestion = e.target.value;
                        setUser((prev) => ({
                          ...prev,
                          securityQA: [
                            ...(prev.securityQA || []).filter(
                              (q) =>
                                q.id !== 1 && q.question !== selectedQuestion
                            ),
                            {
                              id: 1,
                              question: selectedQuestion,
                              answer:
                                prev.securityQA?.find((q) => q.id === 1)
                                  ?.answer || "",
                            },
                          ],
                        }));
                      }}
                    >
                      {securityQuestions.map((question, index) => {
                        // Check if this question is already selected in another dropdown
                        const isSelected = user.securityQA?.some(
                          (q) => q.id !== 1 && q.question === question
                        );
                        return (
                          <MenuItem
                            key={index}
                            value={question}
                            disabled={isSelected}
                          >
                            {question}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Answer 1"
                    name="securityAnswer1"
                    variant="outlined"
                    fullWidth
                    onChange={(e) =>
                      setUser((prev) => ({
                        ...prev,
                        securityQA: [
                          ...(prev.securityQA || []).filter((q) => q.id !== 1),
                          {
                            id: 1,
                            question:
                              prev.securityQA?.find((q) => q.id === 1)
                                ?.question || "",
                            answer: e.target.value,
                          },
                        ],
                      }))
                    }
                    required
                    sx={{ mb: 3 }}
                  />

                  {/* Question 2 */}
                  <FormControl fullWidth required sx={{ mb: 2 }}>
                    <InputLabel>Security Question 2</InputLabel>
                    <Select
                      name="securityQuestion2"
                      value={
                        user.securityQA?.find((q) => q.id === 2)?.question || ""
                      }
                      onChange={(e) => {
                        const selectedQuestion = e.target.value;
                        setUser((prev) => ({
                          ...prev,
                          securityQA: [
                            ...(prev.securityQA || []).filter(
                              (q) =>
                                q.id !== 2 && q.question !== selectedQuestion
                            ),
                            {
                              id: 2,
                              question: selectedQuestion,
                              answer:
                                prev.securityQA?.find((q) => q.id === 2)
                                  ?.answer || "",
                            },
                          ],
                        }));
                      }}
                    >
                      {securityQuestions.map((question, index) => {
                        // Check if this question is already selected in another dropdown
                        const isSelected = user.securityQA?.some(
                          (q) => q.id !== 2 && q.question === question
                        );
                        return (
                          <MenuItem
                            key={index}
                            value={question}
                            disabled={isSelected}
                          >
                            {question}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Answer 2"
                    name="securityAnswer2"
                    variant="outlined"
                    fullWidth
                    onChange={(e) =>
                      setUser((prev) => ({
                        ...prev,
                        securityQA: [
                          ...(prev.securityQA || []).filter((q) => q.id !== 2),
                          {
                            id: 2,
                            question:
                              prev.securityQA?.find((q) => q.id === 2)
                                ?.question || "",
                            answer: e.target.value,
                          },
                        ],
                      }))
                    }
                    required
                    sx={{ mb: 3 }}
                  />

                  {/* Question 3 */}
                  <FormControl fullWidth required sx={{ mb: 2 }}>
                    <InputLabel>Security Question 3</InputLabel>
                    <Select
                      name="securityQuestion3"
                      value={
                        user.securityQA?.find((q) => q.id === 3)?.question || ""
                      }
                      onChange={(e) => {
                        const selectedQuestion = e.target.value;
                        setUser((prev) => ({
                          ...prev,
                          securityQA: [
                            ...(prev.securityQA || []).filter(
                              (q) =>
                                q.id !== 3 && q.question !== selectedQuestion
                            ),
                            {
                              id: 3,
                              question: selectedQuestion,
                              answer:
                                prev.securityQA?.find((q) => q.id === 3)
                                  ?.answer || "",
                            },
                          ],
                        }));
                      }}
                    >
                      {securityQuestions.map((question, index) => {
                        // Check if this question is already selected in another dropdown
                        const isSelected = user.securityQA?.some(
                          (q) => q.id !== 3 && q.question === question
                        );
                        return (
                          <MenuItem
                            key={index}
                            value={question}
                            disabled={isSelected}
                          >
                            {question}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Answer 3"
                    name="securityAnswer3"
                    variant="outlined"
                    fullWidth
                    onChange={(e) =>
                      setUser((prev) => ({
                        ...prev,
                        securityQA: [
                          ...(prev.securityQA || []).filter((q) => q.id !== 3),
                          {
                            id: 3,
                            question:
                              prev.securityQA?.find((q) => q.id === 3)
                                ?.question || "",
                            answer: e.target.value,
                          },
                        ],
                      }))
                    }
                    required
                    sx={{ mb: 3 }}
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 1, display: "flex", alignItems: "center" }}
                  >
                    <PersonIcon color="primary" sx={{ mr: 1 }} /> Profile
                    Picture
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 2,
                      p: 3,
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: 2,
                      backgroundColor: "background.default",
                    }}
                  >
                    <Avatar
                      src={
                        profileImageUrl
                          ? profileImageUrl
                          : file
                          ? URL.createObjectURL(file)
                          : ""
                      }
                      alt="Profile Preview"
                      sx={{
                        width: 100,
                        height: 100,
                        border: "4px solid",
                        borderColor: "background.paper",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        alignItems: { xs: "center", sm: "flex-start" },
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<CloudUploadIcon />}
                          sx={{ borderRadius: 2 }}
                        >
                          Choose File
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, setFile)}
                          />
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleUpload(file, setProfileImageUrl)}
                          disabled={!file}
                          sx={{ borderRadius: 2 }}
                        >
                          Upload
                        </Button>
                      </Box>
                      {file && (
                        <Typography variant="caption">{file.name}</Typography>
                      )}
                      {profileImageUrl && (
                        <Typography
                          variant="caption"
                          color="success.main"
                          sx={{ fontWeight: "bold" }}
                        >
                          ✓ Uploaded successfully!
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: "background.default",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <BusinessIcon color="primary" sx={{ mr: 1 }} />
                      Become a Provider
                      <Tooltip title="Apply to offer your services on our platform">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <HelpOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={user.isSeller}
                          onChange={handleSellerToggle}
                          color="primary"
                        />
                      }
                      label={user.isSeller ? "Yes" : "No"}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Switch on to apply as a service provider and earn by
                    offering your expertise.
                  </Typography>
                </Box>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  sx={{ borderRadius: 2, py: 1.2, px: 3 }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    px: 3,
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {user.isSeller ? "Continue" : ""}
                </Button>
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && user.isSeller && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Business Name"
                  name="providerName"
                  variant="outlined"
                  fullWidth
                  required
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Business Email"
                  name="providerEmail"
                  type="email"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  onBlur={(e) => validateEmail(e.target.value, "providerEmail")}
                  required
                  error={Boolean(errors.providerEmail)}
                  helperText={errors.providerEmail}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Business Address"
                  name="providerAddress"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Business Phone"
                  name="providerPhone"
                  type="tel"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  onBlur={(e) => validatePhone(e.target.value, "providerPhone")}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                  }}
                  required
                  inputProps={{ maxLength: 10 }}
                  error={Boolean(errorNum.providerPhone)}
                  helperText={errorNum.providerPhone}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => {
                    handleChange(e);
                    const error = validateDob(e.target.value);
                    setDobError(error);
                  }}
                  required
                  inputProps={{
                    max: today, // Prevent future dates
                  }}
                  helperText={dobError || "You must be at least 14 years old"}
                  error={Boolean(dobError)}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Service Level</InputLabel>
                  <Select
                    name="serviceLevel"
                    value={user.serviceLevel}
                    onChange={handleChange}
                  >
                    <MenuItem value="Individual">Individual</MenuItem>
                    <MenuItem value="Organisation">Organisation</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Service Hours"
                  name="serviceHours"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  placeholder="e.g., 9 AM - 6 PM, Monday-Friday"
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Profession"
                  name="profession"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Experience"
                  name="experience"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  placeholder="e.g., 5 years in web development"
                  helperText={
                    experienceError ||
                    "Enter years of experience in your field (e.g., '5 years')"
                  }
                  error={Boolean(experienceError)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="About your service"
                  name="desc"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Identity Verification*
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 2,
                      p: 3,
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: 2,
                      backgroundColor: "background.default",
                    }}
                  >
                    <Avatar
                      src={
                        verifyImageUrl
                          ? verifyImageUrl
                          : verifyFile
                          ? URL.createObjectURL(verifyFile)
                          : ""
                      }
                      alt="Verification Preview"
                      variant="rounded"
                      sx={{
                        width: 100,
                        height: 100,
                        border: "4px solid",
                        borderColor: "background.paper",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        alignItems: { xs: "center", sm: "flex-start" },
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<CloudUploadIcon />}
                          sx={{ borderRadius: 2 }}
                        >
                          Select ID
                          <input
                            type="file"
                            hidden
                            accept="application/pdf,image/*"
                            required
                            onChange={(e) => handleFileChange(e, setVerifyFile)}
                          />
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() =>
                            handleUpload(verifyFile, setVerifyImageUrl)
                          }
                          disabled={!verifyFile}
                          sx={{ borderRadius: 2 }}
                        >
                          Upload
                        </Button>
                      </Box>
                      {verifyFile && (
                        <Typography variant="caption">
                          {verifyFile.name}
                        </Typography>
                      )}
                      {verifyImageUrl && (
                        <Typography
                          variant="caption"
                          color="success.main"
                          sx={{ fontWeight: "bold" }}
                        >
                          ✓ Uploaded successfully!
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Please upload a valid ID proof. We accept government-issued
                    photo ID.
                  </Typography>
                </Box>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "space-between" }}
              ></Grid>
            </Grid>
          )}

          {activeStep === steps.length - 1 && (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h5" color="primary" gutterBottom>
                Almost Done!
              </Typography>
              <Typography variant="body1" paragraph>
                Please review your information before submitting. Once
                submitted, you'll be directed to the login page.
              </Typography>

              {error && (
                <Box
                  sx={{
                    bgcolor: "error.main",
                    color: "common.white",
                    p: 2,
                    borderRadius: 2,
                    mb: 3,
                    maxWidth: "500px",
                    mx: "auto",
                  }}
                >
                  <Typography variant="body2" fontWeight="medium">
                    {error}
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  mt: 3,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  sx={{ borderRadius: 2, py: 1.2, px: 4 }}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    px: 4,
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  Complete Registration
                </Button>
              </Box>
            </Box>
          )}
        </form>
      </Paper>
    </Container>
  );
};

export default Register;
