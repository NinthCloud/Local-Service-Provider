import React, { useReducer, useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Box,
  Chip,
  useMediaQuery,
  Card,
  CardMedia,
  MobileStepper,
  alpha,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Add as AddIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  AccessTime as AccessTimeIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  LocationOn as LocationOnIcon,
  Photo as PhotoIcon,
  EventAvailable as EventAvailableIcon,
  CheckCircle as CheckCircleIcon,
  CurrencyRupee as CurrencyRupeeIcon,
  Discount,
} from "@mui/icons-material";
// import Discount from '@mui/icons-material/Info';
import {
  gigReducer,
  INITIAL_STATE,
} from "../../components/reducers/gigReducer";
import upload from "../../utils/upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";
import getCurrentUser from "../../utils/getCurrentUser";

// Create a custom theme
const customTheme = createTheme({
  palette: {
    primary: {
      main: "#2563eb", // Modern blue
      light: "#dbeafe",
      dark: "#1e40af",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#10b981", // Rich green
      light: "#d1fae5",
      dark: "#047857",
      contrastText: "#ffffff",
    },
    error: {
      main: "#ef4444",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#334155",
      secondary: "#64748b",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: "2rem",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.25rem",
    },
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 500,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0px 2px 4px rgba(0, 0, 0, 0.05)",
    "0px 4px 6px rgba(0, 0, 0, 0.05)",
    "0px 6px 12px rgba(0, 0, 0, 0.08)",
    "0px 8px 16px rgba(0, 0, 0, 0.1)",
    // ... rest of the shadows
  ],
});

// Styled components with modern design
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const FeatureChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.main,
  fontWeight: 500,
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.light, 0.8),
  },
  "& .MuiChip-deleteIcon": {
    color: theme.palette.primary.main,
    "&:hover": {
      color: theme.palette.primary.dark,
    },
  },
}));

const ImagePreviewContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  transition: "box-shadow 0.3s ease",
  "&:hover": {
    boxShadow: theme.shadows[2],
  },
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  position: "relative",
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  gap: theme.spacing(1),
}));

const UploadButton = styled(Button)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  borderRadius: theme.shape.borderRadius,
  transition: "all 0.3s ease",
  textTransform: "none",
  boxShadow: "none",
  "&:hover": {
    boxShadow: theme.shadows[2],
    transform: "translateY(-2px)",
  },
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  transition: "all 0.3s ease",
  boxShadow: theme.shadows[1],
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[3],
  },
}));

const DateTimeContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.light, 0.3),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: theme.shadows[2],
    backgroundColor: alpha(theme.palette.primary.light, 0.4),
  },
}));

const Add = () => {
  const [singleFile, setSingleFile] = useState(undefined);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(""); // Track selected category
  const [customCategory, setCustomCategory] = useState(""); // Track custom category text
  const [availability, setAvailability] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [Categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [state, dispatch] = useReducer(gigReducer, INITIAL_STATE);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const queryClient = useQueryClient();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const currentUser = getCurrentUser();
        
        if (!currentUser?.id) {
          // If there's no user ID in local storage, redirect to login
          navigate("/login");
          return;
        }
        
        // Make a direct API call to verify user status from the server
        const response = await newRequest.get(`/users/${currentUser.id}`);
        const userData = response.data;
        
        // Check if user is an approved seller based on server data
        if (!userData?.isSeller || !userData?.approvedByAdmin) {
          navigate("/login");
          return;
        }
        
        // If user is verified, set user ID in state
        if (userData && userData.id) {
          dispatch({ type: "SET_USER_ID", payload: userData.id });
        } else {
          // Fallback to current user ID if provider ID not found
          dispatch({ type: "SET_USER_ID", payload: currentUser.id });
        }
      } catch (error) {
        console.error("Error verifying user status:", error);
        // On error, redirect to login
        navigate("/login");
      }
    };
  
    checkUserStatus();
  }, [navigate, dispatch]);

  const handleChange = (e) => {
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: e.target.name, value: e.target.value },
    });
  };

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // API Calls
  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Updated route to fetch all categories
      const response = await newRequest.get("/categories/category");
      setCategories(response.data);
    } catch (error) {
      // showSnackbar('Failed to fetch categories', 'error');
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);

    // Find the selected category object from the Categories array
    const selectedCategoryObj = Categories.find(
      (cat) => cat.id.toString() === value
    );

    if (selectedCategoryObj) {
      dispatch({
        type: "SELECT_CATEGORY",
        payload: {
          id: selectedCategoryObj.id,
          name: selectedCategoryObj.name,
        },
      });
    }
  };

  // const handleCategoryChange = (e) => {
  //   const value = e.target.value;
  //   setSelectedCategory(value);
  //   if (value !== "custom") {
  //     dispatch({
  //       type: "CHANGE_INPUT",
  //       payload: { name: "cat", value },
  //     });
  //   }
  // };

  const handleCustomCategoryChange = (e) => {
    const value = e.target.value;
    setCustomCategory(value);
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: "cat", value },
    });
  };

  const handleFeature = (e) => {
    e.preventDefault();
    dispatch({
      type: "ADD_FEATURE",
      payload: e.target[0].value,
    });
    e.target[0].value = "";
  };

  const handlePincode = (e) => {
    e.preventDefault();
    dispatch({
      type: "ADD_PINCODE",
      payload: e.target[0].value,
    });
    e.target[0].value = "";
  };

  const handleCity = (e) => {
    e.preventDefault();
    dispatch({
      type: "ADD_CITY",
      payload: e.target[0].value,
    });
    e.target[0].value = "";
  };

  const handleUpload = async () => {
    if (!singleFile && files.length === 0) {
      return;
    }
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulating progress for better UX
      const timer = setInterval(() => {
        setUploadProgress((oldProgress) => {
          const newProgress = Math.min(oldProgress + 10, 90);
          return newProgress;
        });
      }, 500);

      const cover = singleFile ? await upload(singleFile) : "";

      const images = await Promise.all(
        [...files].map(async (file) => {
          const url = await upload(file);
          return url;
        })
      );

      clearInterval(timer);
      setUploadProgress(100);

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        dispatch({ type: "ADD_IMAGES", payload: { cover, images } });
      }, 500);
    } catch (err) {
      console.log(err);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Update availability in state & dispatch
  const updateAvailabilityInState = (newAvailability) => {
    setAvailability(newAvailability); // Update local state
    dispatch({
      type: "UPDATE_AVAILABILITY",
      payload: newAvailability,
    });
  };

  // Add a new availability entry (date)
  const handleAddAvailability = () => {
    setAvailability((prev) => [
      ...prev,
      { date: "", slots: [{ time: "", isBooked: false }] },
    ]);
  };

  // Handle date & time updates
  const handleAvailabilityChange = (availabilityIndex, slotIndex = null, e) => {
    const { name, value } = e.target;
    const newAvailability = [...availability];

    if (name === "date") {
      newAvailability[availabilityIndex] = {
        ...newAvailability[availabilityIndex],
        date: value,
      };
    } else if (name === "time" && slotIndex !== null) {
      newAvailability[availabilityIndex].slots[slotIndex] = {
        ...newAvailability[availabilityIndex].slots[slotIndex],
        time: value,
      };
    }

    updateAvailabilityInState(newAvailability);
  };

  // Add a new time slot
  const handleAddSlot = (index) => {
    setAvailability((prev) => {
      const newAvailability = [...prev];
      newAvailability[index].slots.push({ time: "", isBooked: false });
      return newAvailability;
    });
  };

  // Remove a time slot
  const handleRemoveSlot = (dateIndex, slotIndex) => {
    setAvailability((prev) => {
      const newAvailability = [...prev];
      newAvailability[dateIndex].slots.splice(slotIndex, 1);
      return newAvailability;
    });
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const mutation = useMutation({
    mutationFn: (service) => {
      return newRequest.post("/services", service);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateAvailabilityInState(availability);
    mutation.mutate(state);
    navigate("/myGigs");
  };

  // Number of steps in the image carousel
  const maxSteps = state?.images?.length || 0;

  return (
    <ThemeProvider theme={customTheme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{
            mb: 4,
            color: "primary.dark",
            position: "relative",
            "&:after": {
              content: '""',
              position: "absolute",
              width: "60px",
              height: "4px",
              borderRadius: "2px",
              backgroundColor: "primary.main",
              bottom: "-10px",
              left: "50%",
              transform: "translateX(-50%)",
            },
          }}
        >
          Create Your New Service
        </Typography>

        <Grid container spacing={3}>
          {/* Left column */}
          <Grid item xs={12} md={6}>
            <StyledPaper elevation={3}>
              <FormSection>
                <SectionHeader>
                  <DescriptionIcon color="primary" />
                  <Typography variant="h6" gutterBottom color="primary.dark">
                    Basic Information
                  </Typography>
                </SectionHeader>
                <TextField
                  fullWidth
                  name="title"
                  label="Service Name"
                  variant="outlined"
                  margin="normal"
                  required
                  onChange={handleChange}
                  inputProps={{ maxLength: 255 }}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  name="desc"
                  label="Description"
                  variant="outlined"
                  margin="normal"
                  required
                  multiline
                  rows={4}
                  onChange={handleChange}
                  inputProps={{ maxLength: 255 }}
                  placeholder="Brief description of your service to your customer"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    id="cat"
                    name="cat"
                    value={selectedCategory}
                    label="Category*"
                    required
                    onChange={handleCategoryChange}
                    sx={{ borderRadius: 2 }}
                    startAdornment={
                      selectedCategory && (
                        <CategoryIcon
                          sx={{ ml: 1, mr: 1, color: "primary.main" }}
                        />
                      )
                    }
                  >
                    <MenuItem value="">Select a Category</MenuItem>
                    {Categories.map((category) => (
                      <MenuItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {selectedCategory === "custom" && (
                  <TextField
                    fullWidth
                    name="customCat"
                    label="Custom Category"
                    variant="outlined"
                    margin="normal"
                    value={customCategory}
                    onChange={handleCustomCategoryChange}
                    InputProps={{ sx: { borderRadius: 2 } }}
                  />
                )}
              </FormSection>
              <FormSection>
                <SectionHeader>
                  <PhotoIcon color="primary" />
                  <Typography variant="h6" gutterBottom color="primary.dark">
                    Service Images
                  </Typography>
                </SectionHeader>

                {/* Cover Image Upload */}
                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isMobile ? "stretch" : "flex-start",
                  }}
                >
                  <UploadButton
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 1, px: 3, py: 1.2 }}
                  >
                    Upload Cover Image
                    <VisuallyHiddenInput
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && file.size > 400 * 1024) {
                          alert("Cover image must be 250KB or less.");
                          return;
                        }
                        setSingleFile(file);
                      }}
                    />
                  </UploadButton>
                  {singleFile && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 1,
                      }}
                    >
                      <CheckCircleIcon color="success" fontSize="small" />
                      <Typography variant="body2">
                        Selected: {singleFile.name}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Gallery Images Upload */}
                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isMobile ? "stretch" : "flex-start",
                  }}
                >
                  <UploadButton
                    component="label"
                    variant="outlined"
                    color="primary"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 1, px: 3, py: 1.2 }}
                  >
                    Upload Gallery Images (Max 4)
                    <VisuallyHiddenInput
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const selectedFiles = Array.from(e.target.files);

                        if (selectedFiles.length > 4) {
                          alert("You can only upload up to 4 gallery images.");
                          return;
                        }

                        const oversizedFiles = selectedFiles.filter(
                          (file) => file.size > 300 * 1024
                        );

                        if (oversizedFiles.length > 0) {
                          alert("Each gallery image must be 250KB or less.");
                          return;
                        }

                        setFiles(selectedFiles);
                      }}
                    />
                  </UploadButton>
                  {files.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 1,
                      }}
                    >
                      <CheckCircleIcon color="success" fontSize="small" />
                      <Typography variant="body2">
                        Selected: {files.length} files
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ mb: 3, width: "100%" }}>
                  {uploading && (
                    <Box sx={{ width: "100%", mb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={uploadProgress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.2
                          ),
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        align="center"
                        display="block"
                        sx={{ mt: 0.5 }}
                      >
                        {uploadProgress}% Uploaded
                      </Typography>
                    </Box>
                  )}
                  <AnimatedButton
                    variant="contained"
                    color="primary"
                    onClick={handleUpload}
                    disabled={uploading}
                    fullWidth
                    sx={{
                      mb: 2,
                      py: 1.2,
                      opacity: singleFile || files.length > 0 ? 1 : 0.7,
                    }}
                    startIcon={<CloudUploadIcon />}
                  >
                    {uploading ? "Uploading..." : "Upload Images"}
                  </AnimatedButton>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", textAlign: "center" }}
                  >
                    Maximum file size: 300KB per image
                  </Typography>
                </Box>

                {/* Image Previews */}
                {state?.cover && (
                  <ImagePreviewContainer>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Cover Image:
                    </Typography>
                    <Card
                      sx={{
                        overflow: "hidden",
                        borderRadius: 3,
                        boxShadow: 2,
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.02)",
                          boxShadow: 3,
                        },
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="220"
                        image={state.cover}
                        alt="Cover Preview"
                        sx={{
                          objectFit: "cover",
                          transition: "transform 0.5s ease",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                        }}
                      />
                    </Card>
                  </ImagePreviewContainer>
                )}

                {state?.images && state.images.length > 0 && (
                  <ImagePreviewContainer>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Gallery Images:
                    </Typography>
                    <Card
                      sx={{
                        overflow: "hidden",
                        borderRadius: 3,
                        boxShadow: 2,
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="220"
                        image={state.images[activeStep]}
                        alt={`Image ${activeStep + 1}`}
                        sx={{ objectFit: "cover" }}
                      />
                      <MobileStepper
                        steps={maxSteps}
                        position="static"
                        activeStep={activeStep}
                        sx={{
                          backgroundColor: "background.paper",
                          "& .MuiMobileStepper-dot": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.3
                            ),
                          },
                          "& .MuiMobileStepper-dotActive": {
                            backgroundColor: theme.palette.primary.main,
                          },
                        }}
                        nextButton={
                          <Button
                            size="small"
                            onClick={handleNext}
                            disabled={activeStep === maxSteps - 1}
                            sx={{ fontWeight: "bold" }}
                          >
                            Next
                            <KeyboardArrowRight />
                          </Button>
                        }
                        backButton={
                          <Button
                            size="small"
                            onClick={handleBack}
                            disabled={activeStep === 0}
                            sx={{ fontWeight: "bold" }}
                          >
                            <KeyboardArrowLeft />
                            Back
                          </Button>
                        }
                      />
                    </Card>
                  </ImagePreviewContainer>
                )}
              </FormSection>
              <FormSection>
                <SectionHeader>
                  <DescriptionIcon color="primary" />
                  <Typography variant="h6" gutterBottom color="primary.dark">
                    Addittional service details
                  </Typography>
                </SectionHeader>
                {/* <TextField
                  fullWidth
                  name="shortTitle"
                  label="Service Title"
                  variant="outlined"
                  margin="normal"
                  onChange={handleChange}
                  inputProps={{ maxLength: 255 }}
                  placeholder="e.g. complete car interior cleaning and polishing"
                  InputProps={{ sx: { borderRadius: 2 } }}
                /> */}
                <TextField
                  fullWidth
                  name="shortDesc"
                  label="Additional Description"
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={4}
                  onChange={handleChange}
                  inputProps={{ maxLength: 255 }}
                  placeholder="Detailed description of your service"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </FormSection>
            </StyledPaper>
          </Grid>

          {/* Right column */}
          <Grid item xs={12} md={6}>
            <StyledPaper elevation={3}>
              <FormSection>
                <SectionHeader>
                  <EventAvailableIcon color="primary" />
                  <Typography variant="h6" gutterBottom color="primary.dark">
                    Availability Schedule
                  </Typography>
                </SectionHeader>

                {availability.length === 0 && (
                  <Box
                    sx={{
                      p: 3,
                      textAlign: "center",
                      border: "1px dashed",
                      borderColor: "primary.light",
                      borderRadius: 2,
                      mb: 2,
                      backgroundColor: alpha(theme.palette.primary.light, 0.1),
                    }}
                  >
                    <Typography color="text.secondary">
                      No availability dates added yet. Add your first date
                      below.
                    </Typography>
                  </Box>
                )}

                {availability.map((item, index) => (
                  <DateTimeContainer key={index} elevation={0}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="date"
                          name="date"
                          label="Date"
                          value={item.date}
                          onChange={(e) =>
                            handleAvailabilityChange(index, null, e)
                          }
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            sx: { borderRadius: 2 },
                          }}
                        />
                      </Grid>
                      {item.slots.map((slot, slotIndex) => (
                        <Grid
                          item
                          xs={12}
                          key={slotIndex}
                          container
                          spacing={1}
                          alignItems="center"
                        >
                          <Grid item xs={8} sm={9}>
                            <TextField
                              fullWidth
                              name="time"
                              type="time"
                              label="Time"
                              value={slot.time}
                              onChange={(e) =>
                                handleAvailabilityChange(index, slotIndex, e)
                              }
                              InputLabelProps={{ shrink: true }}
                              InputProps={{
                                sx: { borderRadius: 2 },
                                startAdornment: (
                                  <AccessTimeIcon
                                    sx={{ color: "primary.light", mr: 1 }}
                                  />
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={4} sm={3}>
                            <Tooltip title="Remove time slot">
                              <AnimatedButton
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() =>
                                  handleRemoveSlot(index, slotIndex)
                                }
                                sx={{ borderRadius: 2 }}
                                fullWidth
                              >
                                <CloseIcon fontSize="small" />
                              </AnimatedButton>
                            </Tooltip>
                          </Grid>
                        </Grid>
                      ))}
                      <Grid item xs={12}>
                        <AnimatedButton
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleAddSlot(index)}
                          startIcon={<AddIcon />}
                          sx={{ borderRadius: 2, mt: 1 }}
                        >
                          Add Time Slot
                        </AnimatedButton>
                      </Grid>
                    </Grid>
                  </DateTimeContainer>
                ))}
                <AnimatedButton
                  variant="contained"
                  color="secondary"
                  onClick={handleAddAvailability}
                  startIcon={<AddIcon />}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    py: 1.2,
                  }}
                  fullWidth={isMobile}
                >
                  Add Availability Date
                </AnimatedButton>
              </FormSection>

              <FormSection>
                <SectionHeader>
                  <CheckCircleIcon color="primary" />
                  <Typography variant="h6" gutterBottom color="primary.dark">
                    Service Features
                  </Typography>
                </SectionHeader>
                <Box
                  component="form"
                  onSubmit={handleFeature}
                  sx={{ display: "flex", mb: 2, gap: 1 }}
                >
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="e.g. deep cleaning, polishing, etc."
                    InputProps={{ sx: { borderRadius: 2 } }}
                  />
                  <AnimatedButton
                    variant="contained"
                    type="submit"
                    color="primary"
                    sx={{
                      borderRadius: 2,
                      minWidth: isMobile ? "100%" : "auto",
                    }}
                  >
                    <AddIcon />
                  </AnimatedButton>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    mb: 2,
                    minHeight: "40px",
                  }}
                >
                  {state?.features?.length === 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      No features added yet
                    </Typography>
                  )}
                  {state?.features?.map((f) => (
                    <FeatureChip
                      key={f}
                      label={f}
                      onDelete={() =>
                        dispatch({ type: "REMOVE_FEATURE", payload: f })
                      }
                      deleteIcon={<CloseIcon />}
                    />
                  ))}
                </Box>

                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6}>
                    {/* <TextField
                      fullWidth
                      name="avgServiceTime"
                      label="Service Time"
                      variant="outlined"
                      onChange={handleChange}
                      inputProps={{ maxLength: 255 }}
                      placeholder="e.g. 2 hours"
                      InputProps={{
                        sx: { borderRadius: 2 },
                        startAdornment: (
                          <AccessTimeIcon
                            sx={{ color: "text.secondary", mr: 1 }}
                          />
                        ),
                      }}
                    /> */}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="revisionNumber"
                      label="Discount-offered"
                      variant="outlined"
                      onChange={handleChange}
                      InputProps={{
                        sx: { borderRadius: 2 },
                        startAdornment: (
                          <Discount sx={{ color: "text.secondary", mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="price"
                      label="Price"
                      variant="outlined"
                      type="number"
                      required
                      onChange={handleChange}
                      inputProps={{ min: 0 }}
                      InputProps={{
                        sx: { borderRadius: 2 },
                        startAdornment: (
                          <CurrencyRupeeIcon
                            sx={{ color: "text.secondary", mr: 1 }}
                          />
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </FormSection>
            </StyledPaper>

            <StyledPaper elevation={3}>
              <FormSection>
                <SectionHeader>
                  <LocationOnIcon color="primary" />
                  <Typography variant="h6" gutterBottom color="primary.dark">
                    Service Area
                  </Typography>
                </SectionHeader>

                <Box
                  sx={{
                    backgroundColor: alpha(theme.palette.secondary.light, 0.3),
                    p: 2,
                    borderRadius: 2,
                    mb: 3,
                    border: `1px solid ${alpha(
                      theme.palette.secondary.main,
                      0.3
                    )}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: "text.primary" }}
                  >
                    Define where your service is available to reach the right
                    customers.
                  </Typography>
                </Box>

                {/* Pincodes */}
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Chip
                    label="Pincodes"
                    size="small"
                    sx={{
                      backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                      color: theme.palette.secondary.dark,
                      fontWeight: 600,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Add service areas by pincode
                  </Typography>
                </Typography>

                <Box
                  component="form"
                  onSubmit={handlePincode}
                  sx={{ display: "flex", mb: 2, gap: 1 }}
                >
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="e.g. 787031"
                    InputProps={{
                      sx: { borderRadius: 2 },
                      inputMode: "numeric", // Ensures numeric keyboard on mobile
                      pattern: "[0-9]{6}", // Enforces six digits
                      maxLength: 6, // Prevents more than six digits
                      startAdornment: (
                        <LocationOnIcon
                          sx={{ color: "text.secondary", mr: 1 }}
                        />
                      ),
                    }}
                    onInput={(e) => {
                      e.target.value = e.target.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 6);
                    }}
                  />
                  <AnimatedButton
                    variant="contained"
                    type="submit"
                    color="secondary"
                    sx={{ borderRadius: 2 }}
                  >
                    <AddIcon />
                  </AnimatedButton>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    mb: 3,
                    minHeight: "40px",
                  }}
                >
                  {state?.locationA?.length === 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      No pincodes added yet
                    </Typography>
                  )}
                  {state?.locationA?.map((p) => (
                    <FeatureChip
                      key={p}
                      label={p}
                      onDelete={() =>
                        dispatch({ type: "REMOVE_PINCODE", payload: p })
                      }
                      deleteIcon={<CloseIcon />}
                      sx={{
                        backgroundColor: alpha(
                          theme.palette.secondary.light,
                          0.6
                        ),
                        color: theme.palette.secondary.dark,
                      }}
                    />
                  ))}
                </Box>

                {/* Cities */}
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 2,
                  }}
                >
                  <Chip
                    label="Cities"
                    size="small"
                    sx={{
                      backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                      color: theme.palette.secondary.dark,
                      fontWeight: 600,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Add cities and areas where your service is available
                  </Typography>
                </Typography>

                <Box
                  component="form"
                  onSubmit={handleCity}
                  sx={{ display: "flex", mb: 2, gap: 1 }}
                >
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="e.g. Guwahati"
                    InputProps={{
                      sx: { borderRadius: 2 },
                      startAdornment: (
                        <LocationOnIcon
                          sx={{ color: "text.secondary", mr: 1 }}
                        />
                      ),
                    }}
                  />
                  <AnimatedButton
                    variant="contained"
                    type="submit"
                    color="secondary"
                    sx={{ borderRadius: 2 }}
                  >
                    <AddIcon />
                  </AnimatedButton>
                </Box>
                <Box
                  sx={{ display: "flex", flexWrap: "wrap", minHeight: "40px" }}
                >
                  {state?.locationB?.length === 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      No cities added yet
                    </Typography>
                  )}
                  {state?.locationB?.map((c) => (
                    <FeatureChip
                      key={c}
                      label={c}
                      onDelete={() =>
                        dispatch({ type: "REMOVE_CITY", payload: c })
                      }
                      deleteIcon={<CloseIcon />}
                      sx={{
                        backgroundColor: alpha(
                          theme.palette.secondary.light,
                          0.6
                        ),
                        color: theme.palette.secondary.dark,
                      }}
                    />
                  ))}
                </Box>
              </FormSection>
            </StyledPaper>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 4,
            mb: 2,
            display: "flex",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <AnimatedButton
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSubmit}
            sx={{
              px: isMobile ? 4 : 8,
              py: 1.5,
              borderRadius: 3,
              fontSize: "1.1rem",
              fontWeight: 600,
              boxShadow: theme.shadows[4],
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background: `linear-gradient(90deg, transparent, ${alpha(
                  theme.palette.common.white,
                  0.2
                )}, transparent)`,
                transition: "left 1s ease",
              },
              "&:hover::before": {
                left: "100%",
              },
            }}
            disableElevation
          >
            Create Service
          </AnimatedButton>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Add;
