import React, { useReducer, useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
  IconButton,
  Paper,
  InputLabel,
  Card,
  useTheme,
  useMediaQuery,
  MobileStepper,
  CircularProgress,
  FormControl,
  Chip,
  Stack,
  Fade,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  CloudUpload,
  ArrowBack,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  AccessTime,
  LocationOn,
  CalendarMonth,
  Category,
  Description,
  Title,
  PhotoCamera,
  FormatListBulleted,
  CurrencyRupee as CurrencyRupeeIcon,
  Discount
} from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SwipeableViews from "react-swipeable-views";
import {
  gigReducer,
  INITIAL_STATE,
} from "../../components/reducers/gigReducer";
import upload from "../../utils/upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useNavigate, useParams } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";

const EditGig = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const { id } = useParams();
  // console.log("Extracted ID from URL:", id);
  const [singleFile, setSingleFile] = useState(undefined);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [Categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [state, dispatch] = useReducer(gigReducer, INITIAL_STATE);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const sections = [
    { label: "Basic Info", icon: <Description /> },
    { label: "Images", icon: <PhotoCamera /> },
    { label: "Features ", icon: <FormatListBulleted /> },
    { label: "Availability", icon: <CalendarMonth /> },
    { label: "Location", icon: <LocationOn /> },
  ];

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

  useEffect(() => {
    // console.log("Gig ID before request:", id); // Debugging

    if (!id) {
      console.error("Error: Gig ID is undefined");
      return; // Prevent making the request if ID is missing
    }

    const fetchGig = async () => {
      try {
        const response = await newRequest.get(`/services/single/${id}`);
        dispatch({
          type: "SET_GIG",
          payload: {
            ...response.data,
            availability: response.data.availability || [],
          },
        });
        setAvailability(response.data.availability || []);
      } catch (err) {
        console.error("Error fetching gig data:", err);
        showAlert("Error loading service data", "error");
      }
    };

    fetchGig();
  }, [id]);

  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "cat") {
      // Find the category object based on the selected name
      const selectedCategory = Categories.find((cat) => cat.name === value);
      if (selectedCategory) {
        dispatch({
          type: "SELECT_CATEGORY",
          payload: { id: selectedCategory.id, name: value },
        });
      } else {
        dispatch({ type: "CHANGE_INPUT", payload: { name, value } });
      }
    } else if (name === "customCategory") {
      dispatch({ type: "CHANGE_INPUT", payload: { name: "cat", value } });
    } else {
      setIsCustomCategory(false);
      dispatch({ type: "CHANGE_INPUT", payload: { name, value } });
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      const cover = await upload(singleFile);
      const images = await Promise.all(
        [...files].map(async (file) => upload(file))
      );
      setUploading(false);
      dispatch({ type: "ADD_IMAGES", payload: { cover, images } });
      showAlert("Images uploaded successfully", "success");
    } catch (err) {
      console.error(err);
      setUploading(false);
      showAlert("Error uploading images", "error");
    }
  };

  const handleAddFeature = (e) => {
    e.preventDefault();
    const value = e.target.feature.value.trim();
    if (value) {
      dispatch({ type: "ADD_FEATURE", payload: value });
      e.target.reset();
    }
  };

  const mutation = useMutation({
    mutationFn: (service) => newRequest.put(`/services/${id}`, service),
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
      showAlert("Service updated successfully", "success");
      setTimeout(() => navigate("/myGigs"), 1500);
    },
    onError: (error) => {
      console.error("Error updating service:", error);
      showAlert("Error updating service", "error");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(state);
  };

  const updateAvailabilityInState = (newAvailability) => {
    setAvailability(newAvailability);
    dispatch({
      type: "UPDATE_AVAILABILITY",
      payload: newAvailability,
    });
  };

  // Add new availability entry
  const handleAddAvailability = () => {
    setAvailability([
      ...availability,
      {
        date: "",
        slots: [{ time: "", isBooked: false }],
      },
    ]);
  };

  // Handle change in availability (date or time slot)
  const handleAvailabilityChange = (index, e) => {
    const { name, value } = e.target;
    const newAvailability = [...availability];

    if (name === "date") {
      newAvailability[index].date = value;
    } else {
      const slotIndex = e.target.dataset.index;
      newAvailability[index].slots[slotIndex].time = value;
    }

    setAvailability(newAvailability);
    updateAvailabilityInState(newAvailability);
  };

  // Handle time slot change correctly
  const handleSlotChange = (index, slotIndex, e) => {
    const newAvailability = [...availability];
    newAvailability[index].slots[slotIndex].time = e.target.value; // Update time slot
    setAvailability(newAvailability);
    updateAvailabilityInState(newAvailability);
  };

  // Handle adding/removing time slots
  const handleAddSlot = (index) => {
    const newAvailability = [...availability];
    newAvailability[index].slots.push({ time: "", isBooked: false });
    setAvailability(newAvailability);
  };

  const handleRemoveSlot = (dateIndex, slotIndex) => {
    const newAvailability = [...availability];
    newAvailability[dateIndex].slots.splice(slotIndex, 1);
    setAvailability(newAvailability);
    updateAvailabilityInState(newAvailability);
  };

  const handleRemoveAvailability = (index) => {
    const newAvailability = [...availability];
    newAvailability.splice(index, 1);
    setAvailability(newAvailability);
    dispatch({
      type: "UPDATE_AVAILABILITY",
      payload: newAvailability,
    });
  };

  const maxSteps =
    state.images && Array.isArray(state.images) ? state.images.length : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alertSeverity}
          sx={{ width: "100%", boxShadow: 3 }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          background: "linear-gradient(145deg, #ffffff, #f9f9ff)",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            py: 3,
            px: 4,
            background: "linear-gradient(90deg, #6366F1, #8B5CF6)",
            color: "white",
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box display="flex" alignItems="center">
            <IconButton
              onClick={() => navigate("/myGigs")}
              size="medium"
              sx={{
                mr: 2,
                color: "white",
                background: "rgba(255,255,255,0.1)",
                "&:hover": { background: "rgba(255,255,255,0.2)" },
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Edit Service
              </Typography>
              {state.title && (
                <Typography variant="subtitle1" sx={{ opacity: 0.8, mt: 0.5 }}>
                  {state.title}
                </Typography>
              )}
            </Box>
          </Box>
          {/* <Tooltip title="Save Changes">
            <Button
              variant="contained"
              color="success"
              onClick={handleSubmit}
              sx={{
                borderRadius: 2,
                px: 3,
                fontWeight: "bold",
                background: "white",
                color: "primary.main",
                "&:hover": { background: "rgba(255,255,255,0.9)" },
              }}
              startIcon={<CheckCircleIcon />}
            >
              {mutation.isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </Tooltip> */}
        </Box>

        {/* Navigation */}
        {!isMobile && (
          <Box sx={{ px: 4, mb: 4 }}>
            <Stepper activeStep={activeSection} alternativeLabel={isTablet}>
              {sections.map((section, index) => (
                <Step
                  key={section.label}
                  onClick={() => setActiveSection(index)}
                  sx={{ cursor: "pointer" }}
                >
                  <StepLabel icon={section.icon}>{section.label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}

        {isMobile && (
          <Box sx={{ px: 2, mb: 3, overflowX: "auto" }}>
            <Stack direction="row" spacing={1} sx={{ pb: 1 }}>
              {sections.map((section, index) => (
                <Chip
                  key={section.label}
                  label={section.label}
                  icon={section.icon}
                  onClick={() => setActiveSection(index)}
                  color={activeSection === index ? "primary" : "default"}
                  variant={activeSection === index ? "filled" : "outlined"}
                  sx={{ py: 2 }}
                />
              ))}
            </Stack>
          </Box>
        )}

        <Box sx={{ px: { xs: 2, md: 4 }, pb: 4 }}>
          {/* Image Preview Section */}
          {(state.cover || (state.images && state.images.length > 0)) &&
            activeSection === 1 && (
              <Fade in={true}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: 2,
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Images Preview
                  </Typography>

                  {state.cover && (
                    <Box mb={3}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Cover Image:
                      </Typography>
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          height: 250,
                          borderRadius: 2,
                          overflow: "hidden",
                          backgroundColor: "#f5f5f5",
                        }}
                      >
                        <Box
                          component="img"
                          src={state.cover}
                          alt="Cover"
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  {state.images && state.images.length > 0 && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Gallery Images:
                      </Typography>
                      <Card
                        elevation={0}
                        sx={{
                          maxWidth: "100%",
                          flexGrow: 1,
                          borderRadius: 2,
                          overflow: "hidden",
                          border: "1px solid rgba(0,0,0,0.08)",
                        }}
                      >
                        <SwipeableViews
                          axis={theme.direction === "rtl" ? "x-reverse" : "x"}
                          index={activeStep}
                          onChangeIndex={handleStepChange}
                          enableMouseEvents
                        >
                          {state.images.map((image, index) => (
                            <Box
                              key={index}
                              sx={{
                                height: 300,
                                display: "flex",
                                justifyContent: "center",
                                p: 2,
                                bgcolor: "#f5f5f5",
                              }}
                            >
                              <img
                                src={image}
                                alt={`Gallery image ${index + 1}`}
                                style={{
                                  height: "100%",
                                  maxWidth: "100%",
                                  objectFit: "cover",
                                  borderRadius: 8,
                                }}
                              />
                            </Box>
                          ))}
                        </SwipeableViews>
                        <MobileStepper
                          steps={maxSteps}
                          position="static"
                          activeStep={activeStep}
                          sx={{ background: "white" }}
                          nextButton={
                            <Button
                              size="small"
                              onClick={handleNext}
                              disabled={activeStep === maxSteps - 1}
                              endIcon={
                                theme.direction === "rtl" ? (
                                  <KeyboardArrowLeft />
                                ) : (
                                  <KeyboardArrowRight />
                                )
                              }
                            >
                              Next
                            </Button>
                          }
                          backButton={
                            <Button
                              size="small"
                              onClick={handleBack}
                              disabled={activeStep === 0}
                              startIcon={
                                theme.direction === "rtl" ? (
                                  <KeyboardArrowRight />
                                ) : (
                                  <KeyboardArrowLeft />
                                )
                              }
                            >
                              Back
                            </Button>
                          }
                        />
                      </Card>
                    </Box>
                  )}
                </Card>
              </Fade>
            )}

          <Grid container spacing={3}>
            {/* Basic Information Section */}
            {activeSection === 0 && (
              <Fade in={true}>
                <Grid item xs={12}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={2}>
                      <Description
                        fontSize="small"
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="h6" fontWeight="bold">
                        Basic Information
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Service Name"
                          name="title"
                          variant="outlined"
                          value={state.title || ""}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <Title
                                color="action"
                                sx={{ mr: 1 }}
                                fontSize="small"
                              />
                            ),
                          }}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        {/* <TextField
                          fullWidth
                          label="Service Title"
                          name="shortTitle"
                          variant="outlined"
                          value={state.shortTitle || ""}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <Title
                                color="action"
                                sx={{ mr: 1 }}
                                fontSize="small"
                              />
                            ),
                          }}
                          sx={{ mb: 2 }}
                        /> */}
                      </Grid>
                      <Grid item xs={12} md={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          name="desc"
                          variant="outlined"
                          multiline
                          rows={3}
                          value={state.desc || ""}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <Description
                                color="action"
                                sx={{ mr: 1, mt: 1 }}
                                fontSize="small"
                              />
                            ),
                          }}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={12}>
                        <TextField
                          fullWidth
                          label="Additional Description"
                          name="shortDesc"
                          variant="outlined"
                          multiline
                          rows={2}
                          value={state.shortDesc || ""}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <Description
                                color="action"
                                sx={{ mr: 1, mt: 1 }}
                                fontSize="small"
                              />
                            ),
                          }}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>Category</InputLabel>
                          <Select
                            name="cat"
                            value={state.cat || ""}
                            onChange={handleChange}
                            label="Category"
                            startAdornment={
                              <Category
                                color="action"
                                sx={{ mr: 1 }}
                                fontSize="small"
                              />
                            }
                          >
                            <MenuItem value="">Select a Category</MenuItem>
                            {/* Replace the hardcoded MenuItems below with this dynamic list */}
                            {Categories.map((category) => (
                              <MenuItem
                                key={category.id}
                                value={category.name}
                                onClick={() =>
                                  dispatch({
                                    type: "SELECT_CATEGORY",
                                    payload: {
                                      id: category.id,
                                      name: category.name,
                                    },
                                  })
                                }
                              >
                                {category.name}
                              </MenuItem>
                            ))}{" "}
                            {/* Remove these hardcoded items
                              <MenuItem value="Home Cleaning">Home Cleaning</MenuItem>
                              <MenuItem value="Plumbing">Plumbing</MenuItem>
                              ...and so on
                              */}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Price"
                          name="price"
                          variant="outlined"
                          value={state.price || ""}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <CurrencyRupeeIcon
                                color="action"
                                sx={{ mr: 1 }}
                                fontSize="small"
                              />
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        {/* <TextField
                          fullWidth
                          label="Service Time"
                          name="avgServiceTime"
                          variant="outlined"
                          value={state.avgServiceTime || ""}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <AccessTime
                                color="action"
                                sx={{ mr: 1 }}
                                fontSize="small"
                              />
                            ),
                          }}
                        /> */}
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Discount-offered"
                          name="revisionNumber"
                          variant="outlined"
                          value={state.revisionNumber || ""}
                          onChange={handleChange}
                          InputProps={{
                            sx: { borderRadius: 2 },
                            startAdornment: (
                              <Discount
                                sx={{ color: "text.secondary", mr: 1 }}
                              />
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              </Fade>
            )}

            {/* Images Upload Section */}
            {activeSection === 1 && (
              <Fade in={true}>
                <Grid item xs={12}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={3}>
                      <PhotoCamera
                        fontSize="small"
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="h6" fontWeight="bold">
                        Images
                      </Typography>
                    </Box>

                    <Grid container spacing={3}>
                      {/* Cover Image */}
                      <Grid item xs={12} md={6}>
                        <Card
                          elevation={0}
                          sx={{
                            p: 3,
                            height: "100%",
                            border: "1px dashed rgba(0,0,0,0.2)",
                            borderRadius: 2,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            bgcolor: "rgba(0,0,0,0.02)",
                            transition: "all 0.3s",
                            "&:hover": {
                              bgcolor: "rgba(0,0,0,0.04)",
                            },
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            gutterBottom
                            fontWeight="bold"
                          >
                            Cover Image
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            align="center"
                            sx={{ mb: 2 }}
                          >
                            Main image for your service (max 400KB)
                          </Typography>

                          <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUpload />}
                            sx={{
                              mb: 2,
                              borderRadius: 2,
                              px: 3,
                              py: 1,
                            }}
                          >
                            Select Cover
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file && file.size > 400 * 1024) {
                                  alert("Cover image must be 400KB or less.");
                                  return;
                                }
                                setSingleFile(file);
                              }}
                            />
                          </Button>

                          {singleFile && (
                            <Chip
                              label={singleFile.name}
                              variant="outlined"
                              color="primary"
                              onDelete={() => setSingleFile(undefined)}
                            />
                          )}
                        </Card>
                      </Grid>

                      {/* Gallery Images */}
                      <Grid item xs={12} md={6}>
                        <Card
                          elevation={0}
                          sx={{
                            p: 3,
                            height: "100%",
                            border: "1px dashed rgba(0,0,0,0.2)",
                            borderRadius: 2,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            bgcolor: "rgba(0,0,0,0.02)",
                            transition: "all 0.3s",
                            "&:hover": {
                              bgcolor: "rgba(0,0,0,0.04)",
                            },
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            gutterBottom
                            fontWeight="bold"
                          >
                            Gallery Images
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            align="center"
                            sx={{ mb: 2 }}
                          >
                            Up to 4 images (max 300KB each)
                          </Typography>

                          <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUpload />}
                            sx={{
                              mb: 2,
                              borderRadius: 2,
                              px: 3,
                              py: 1,
                            }}
                          >
                            Select Gallery Images
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              multiple
                              onChange={(e) => {
                                const selectedFiles = Array.from(
                                  e.target.files
                                );

                                if (selectedFiles.length > 4) {
                                  alert(
                                    "You can only upload up to 4 gallery images."
                                  );
                                  return;
                                }

                                const oversizedFiles = selectedFiles.filter(
                                  (file) => file.size > 300 * 1024
                                );

                                if (oversizedFiles.length > 0) {
                                  alert(
                                    "Each gallery image must be 300KB or less."
                                  );
                                  return;
                                }

                                setFiles(selectedFiles);
                              }}
                            />
                          </Button>

                          {files.length > 0 && (
                            <Stack
                              direction="row"
                              spacing={1}
                              flexWrap="wrap"
                              justifyContent="center"
                            >
                              {Array.from(files).map((file, index) => (
                                <Chip
                                  key={index}
                                  label={
                                    file.name.substring(0, 15) +
                                    (file.name.length > 15 ? "..." : "")
                                  }
                                  variant="outlined"
                                  color="primary"
                                />
                              ))}
                            </Stack>
                          )}
                        </Card>
                      </Grid>

                      {/* Upload Button */}
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 2,
                          }}
                        >
                          <Button
                            variant="contained"
                            onClick={handleUpload}
                            disabled={uploading}
                            startIcon={
                              uploading ? (
                                <CircularProgress size={20} />
                              ) : (
                                <CloudUpload />
                              )
                            }
                            sx={{
                              borderRadius: 2,
                              px: 4,
                              py: 1.5,
                              fontWeight: "bold",
                              boxShadow: 2,
                            }}
                          >
                            {uploading ? "Uploading..." : "Upload Images"}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              </Fade>
            )}

            {/* Features Section */}
            {activeSection === 2 && (
              <Fade in={true}>
                <Grid item xs={12}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={3}>
                      <FormatListBulleted
                        fontSize="small"
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="h6" fontWeight="bold">
                        Service Features
                      </Typography>
                    </Box>

                    <form onSubmit={handleAddFeature}>
                      <Grid container spacing={2} alignItems="flex-start">
                        <Grid item xs={12} md={8}>
                          <TextField
                            name="feature"
                            placeholder="e.g. High-quality service"
                            fullWidth
                            variant="outlined"
                            label="Add Feature"
                            InputProps={{
                              startAdornment: (
                                <CheckCircleIcon
                                  color="action"
                                  sx={{ mr: 1 }}
                                  fontSize="small"
                                />
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={<AddIcon />}
                            fullWidth
                            sx={{
                              py: 1.7,
                              borderRadius: 2,
                            }}
                          >
                            Add Feature
                          </Button>
                        </Grid>
                      </Grid>
                    </form>

                    <Box
                      sx={{ mt: 3, display: "flex", flexWrap: "wrap", gap: 1 }}
                    >
                      {state.features?.map((feature) => (
                        <Chip
                          key={feature}
                          label={feature}
                          onDelete={() =>
                            dispatch({
                              type: "REMOVE_FEATURE",
                              payload: feature,
                            })
                          }
                          color="primary"
                          variant="outlined"
                          sx={{
                            m: 0.5,
                            borderRadius: 2,
                            py: 2,
                          }}
                        />
                      ))}
                    </Box>
                  </Card>
                </Grid>
              </Fade>
            )}

            {/* Availability Section */}
            {activeSection === 3 && (
              <Fade in={true}>
                <Grid item xs={12}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={3}>
                      <CalendarMonth
                        fontSize="small"
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="h6" fontWeight="bold">
                        Service Availability
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" mb={3}>
                      Add dates and time slots when your service is available
                      for booking.
                    </Typography>

                    {availability.length === 0 && (
                      <Box
                        sx={{
                          textAlign: "center",
                          py: 4,
                          backgroundColor: "rgba(0,0,0,0.01)",
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body1" color="text.secondary">
                          No availability dates added yet
                        </Typography>
                      </Box>
                    )}

                    {availability.map((availabilityItem, index) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 2,
                          border: "1px solid rgba(0,0,0,0.08)",
                          bgcolor: "rgba(0,0,0,0.01)",
                          position: "relative",
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={4}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <TextField
                                fullWidth
                                type="date"
                                name="date"
                                label="Date"
                                value={availabilityItem.date || ""}
                                onChange={(e) =>
                                  handleAvailabilityChange(index, e)
                                }
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                inputProps={{
                                  min: new Date().toISOString().split("T")[0],
                                }}
                              />
                              <IconButton
                                onClick={() => handleRemoveAvailability(index)}
                                color="error"
                                size="small"
                                sx={{
                                  ml: 1,
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  bgcolor: "rgba(255,0,0,0.05)",
                                  "&:hover": {
                                    bgcolor: "rgba(255,0,0,0.1)",
                                  },
                                }}
                                aria-label="Delete day"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={8}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                              }}
                            >
                              {availabilityItem.slots.length === 0 && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  No time slots added yet
                                </Typography>
                              )}

                              {availabilityItem.slots.map((slot, slotIndex) => (
                                <Box
                                  key={slotIndex}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <TextField
                                    fullWidth
                                    type="time"
                                    label={`Time Slot ${slotIndex + 1}`}
                                    value={slot.time || ""}
                                    onChange={(e) =>
                                      handleSlotChange(index, slotIndex, e)
                                    }
                                    InputLabelProps={{ shrink: true }}
                                    variant="outlined"
                                    disabled={slot.isBooked}
                                    helperText={
                                      slot.isBooked
                                        ? "This slot is already booked"
                                        : ""
                                    }
                                  />
                                  {!slot.isBooked && (
                                    <IconButton
                                      onClick={() =>
                                        handleRemoveSlot(index, slotIndex)
                                      }
                                      color="error"
                                      size="small"
                                      sx={{
                                        flexShrink: 0,
                                        width: 28,
                                        height: 28,
                                        borderRadius: "50%",
                                        bgcolor: "rgba(255,0,0,0.05)",
                                        "&:hover": {
                                          bgcolor: "rgba(255,0,0,0.1)",
                                        },
                                      }}
                                      aria-label="Remove time slot"
                                    >
                                      <DeleteIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  )}
                                </Box>
                              ))}
                              <Button
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => handleAddSlot(index)}
                                sx={{ width: "fit-content" }}
                              >
                                Add Time Slot
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}

                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 3 }}
                    >
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddAvailability}
                        sx={{ borderRadius: 2, px: 3 }}
                      >
                        Add New Day
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              </Fade>
            )}
            {/* Location Section */}
            {activeSection === 4 && (
              <Fade in={true}>
                <Grid item xs={12}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={3}>
                      <LocationOn
                        fontSize="small"
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="h6" fontWeight="bold">
                        Service Location
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" mb={3}>
                      Add locations where your service is available. You can add
                      multiple cities and PIN codes.
                    </Typography>

                    <Grid container spacing={3}>
                      {/* City Section */}
                      <Grid item xs={12} md={6}>
                        <Card
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            border: "1px solid rgba(0,0,0,0.08)",
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            gutterBottom
                          >
                            Cities
                          </Typography>

                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const value = e.target.city.value.trim();
                              if (value) {
                                dispatch({ type: "ADD_CITY", payload: value });
                                e.target.reset();
                              }
                            }}
                            style={{ marginBottom: "16px" }}
                          >
                            <Grid container spacing={2} alignItems="flex-start">
                              <Grid item xs={8}>
                                <TextField
                                  name="city"
                                  placeholder="e.g. Mumbai"
                                  fullWidth
                                  variant="outlined"
                                  label="Add City"
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <Button
                                  type="submit"
                                  variant="contained"
                                  startIcon={<AddIcon />}
                                  fullWidth
                                  size="medium"
                                  sx={{ py: 1, borderRadius: 2 }}
                                >
                                  Add
                                </Button>
                              </Grid>
                            </Grid>
                          </form>

                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                          >
                            {state.locationB &&
                              state.locationB.map((city) => (
                                <Chip
                                  key={city}
                                  label={city}
                                  onDelete={() =>
                                    dispatch({
                                      type: "REMOVE_CITY",
                                      payload: city,
                                    })
                                  }
                                  color="primary"
                                  sx={{ m: 0.5 }}
                                />
                              ))}
                            {(!state.locationB ||
                              state.locationB.length === 0) && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                No cities added yet
                              </Typography>
                            )}
                          </Box>
                        </Card>
                      </Grid>

                      {/* Pincode Section */}
                      <Grid item xs={12} md={6}>
                        <Card
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            border: "1px solid rgba(0,0,0,0.08)",
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            gutterBottom
                          >
                            PIN Codes
                          </Typography>

                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const value = e.target.pincode.value.trim();
                              if (value) {
                                dispatch({
                                  type: "ADD_PINCODE",
                                  payload: value,
                                });
                                e.target.reset();
                              }
                            }}
                            style={{ marginBottom: "16px" }}
                          >
                            <Grid container spacing={2} alignItems="flex-start">
                              <Grid item xs={8}>
                                <TextField
                                  name="pincode"
                                  placeholder="e.g. 400001"
                                  fullWidth
                                  variant="outlined"
                                  label="Add PIN Code"
                                  size="small"
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
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <Button
                                  type="submit"
                                  variant="contained"
                                  startIcon={<AddIcon />}
                                  fullWidth
                                  size="medium"
                                  sx={{ py: 1, borderRadius: 2 }}
                                >
                                  Add
                                </Button>
                              </Grid>
                            </Grid>
                          </form>

                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                          >
                            {state.locationA &&
                              state.locationA.map((pincode) => (
                                <Chip
                                  key={pincode}
                                  label={pincode}
                                  onDelete={() =>
                                    dispatch({
                                      type: "REMOVE_PINCODE",
                                      payload: pincode,
                                    })
                                  }
                                  color="primary"
                                  sx={{ m: 0.5 }}
                                />
                              ))}
                            {(!state.locationA ||
                              state.locationA.length === 0) && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                No PIN codes added yet
                              </Typography>
                            )}
                          </Box>
                        </Card>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              </Fade>
            )}
          </Grid>
        </Box>
        {/* Submit Button */}
        <Box
          sx={{
            p: 3,
            background: "linear-gradient(to right, #f5f7ff, #f0f2ff)",
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(0,0,0,0.05)",
            mt: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/myGigs")}
            startIcon={<ArrowBack />}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={mutation.isLoading}
            startIcon={
              mutation.isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <CheckCircleIcon />
              )
            }
            sx={{
              borderRadius: 2,
              px: 4,
              fontWeight: "bold",
              boxShadow: 2,
            }}
          >
            {mutation.isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditGig;
