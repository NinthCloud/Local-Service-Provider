import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Box,
  Paper,
  Grid,
  Divider,
  useTheme,
  useMediaQuery,
  styled,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip,
  FormHelperText,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NotesIcon from "@mui/icons-material/Notes";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import newRequest from "../../utils/newRequest";
import getCurrentUser from "../../utils/getCurrentUser";

// Styled components
const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(5),
  marginBottom: theme.spacing(5),
  [theme.breakpoints.down("sm")]: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 8px 40px rgba(0, 0, 0, 0.12)",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 12px 50px rgba(0, 0, 0, 0.16)",
  },
}));

const BookingHeader = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
  color: "white",
  padding: theme.spacing(3, 4),
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
}));

const BookingForm = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3, 2),
  },
}));

const FormDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(3, 0),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.2),
  borderRadius: 8,
  fontWeight: 600,
  textTransform: "none",
  fontSize: "1rem",
  boxShadow: "0 4px 15px rgba(37, 117, 252, 0.2)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 18px rgba(37, 117, 252, 0.3)",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
    transition: "all 0.3s ease",
    "&:hover": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused": {
      boxShadow: "0 0 0 2px rgba(37, 117, 252, 0.2)",
    },
  },
}));

const CalendarField = styled(StyledTextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
  },
  "& input[type=date]::-webkit-calendar-picker-indicator": {
    cursor: "pointer",
    filter: "invert(0.5)",
    opacity: 0.6,
    transition: "opacity 0.2s",
    "&:hover": {
      opacity: 1,
    },
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  "& svg": {
    color: theme.palette.primary.main,
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
    transition: "all 0.3s ease",
    "&:hover": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused": {
      boxShadow: "0 0 0 2px rgba(37, 117, 252, 0.2)",
    },
  },
}));

// Main component
const Booking = () => {
  const { id: serviceId } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [gigData, setGigData] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (!serviceId || serviceId === "undefined") {
      navigate("/", { replace: true });
    }
  
    const fetchGigData = async () => {
      try {
        const response = await newRequest.get(`/services/single/${serviceId}`);
        setGigData(response.data);
      } catch (err) {
        console.error("Error fetching gig data:", err);
      }
    };
  
    fetchGigData();
  }, [serviceId, navigate]); // ✅ Removed `currentUser` & `dataLoaded` from dependencies
  
  useEffect(() => {
    if (!currentUser || !currentUser.id || dataLoaded) return;
  
    const fetchUserData = async () => {
      try {
        const response = await newRequest.get(`/users/${currentUser.id}`);
        const userData = response.data;
  
        setName(userData.username || "");
        setPhone(userData.phone || "");
        setAddress(userData.address || "");
        setEmail(userData.email || "");
        setDataLoaded(true);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user information.");
      }
    };
  
    fetchUserData();
  }, [currentUser]); // ✅ Now runs only when `currentUser` changes
  

  useEffect(() => {
    if (!preferredDate) return; // ✅ Ensure preferredDate exists before running
  
    const fetchAvailability = async () => {
      try {
        const response = await newRequest.get(
          `/services/${serviceId}/availability?date=${preferredDate}`
        );
  
        if (Array.isArray(response.data)) {
          setAvailableTimes(response.data);
        } else {
          setAvailableTimes([]);
        }
      } catch (err) {
        console.error("Error fetching availability:", err);
        setAvailableTimes([]);
      }
    };
  
    fetchAvailability();
  }, [preferredDate, serviceId]); // ✅ Runs only when these change
  

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const validatePhone = (phone) => {
    return phone.length === 10;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setEmailError("");
    setPhoneError("");

    // Validation
    let hasError = false;

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      hasError = true;
    }

    if (!validatePhone(phone)) {
      setPhoneError("Phone number must be 10 digits");
      hasError = true;
    }

    if (!preferredTime) {
      setError("Please select an available time slot.");
      hasError = true;
    }

    if (hasError) {
      setIsSubmitting(false);
      return;
    }

    try {
      await newRequest.post(`/bookings/${serviceId}`, {
        name,
        phone,
        address,
        email,
        preferredDate,
        preferredTime,
        notes,
      });

      navigate(`/orders`);
    } catch (err) {
      console.error("Error during order placement:", err);
      setError("Something went wrong, please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(value);
    if (value.length > 0 && value.length !== 10) {
      setPhoneError("Phone number must be 10 digits");
    } else {
      setPhoneError("");
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  return (
    <StyledContainer maxWidth="md">
      <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
        <Tooltip title="Go Back">
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ mr: 2, backgroundColor: "rgba(0, 0, 0, 0.04)" }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <StyledPaper elevation={0}>
        <BookingHeader>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Book Your Service
          </Typography>
          {gigData && (
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              {gigData.title}
            </Typography>
          )}
        </BookingHeader>

        {error && (
          <Alert
            severity="error"
            sx={{ mx: 4, mt: 4, borderRadius: 2, boxShadow: 1 }}
          >
            {error}
          </Alert>
        )}

        <BookingForm
          component="form"
          onSubmit={handleSubmit}
        >
          <SectionTitle variant="h6">
            <PersonIcon /> Personal Information
          </SectionTitle>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                label="Name"
                variant="outlined"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                label="Phone"
                variant="outlined"
                fullWidth
                value={phone}
                onChange={handlePhoneChange}
                required
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
                error={!!phoneError}
                helperText={phoneError}
              />
            </Grid>
            <Grid item xs={12}>
              <StyledTextField
                label="Email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={handleEmailChange}
                required
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
                error={!!emailError}
                helperText={emailError}
              />
            </Grid>
            <Grid item xs={12}>
              <StyledTextField
                label="Address"
                variant="outlined"
                fullWidth
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>
          </Grid>

          <FormDivider />

          <SectionTitle variant="h6">
            <EventAvailableIcon /> Booking Details
          </SectionTitle>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <CalendarField
                label="Preferred Date"
                type="date"
                variant="outlined"
                fullWidth
                value={preferredDate}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split("T")[0] }}
                onChange={(e) => setPreferredDate(e.target.value)}
                required
                InputProps={{
                  startAdornment: <CalendarMonthIcon sx={{ mr: 1, opacity: 0.6 }} />,
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledFormControl
                fullWidth
                variant="outlined"
                required
                disabled={availableTimes.length === 0}
              >
                <InputLabel>Preferred Time</InputLabel>
                <Select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  label="Preferred Time"
                  startAdornment={<AccessTimeIcon sx={{ mr: 1, opacity: 0.6 }} />}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="" disabled>
                    Select a time slot
                  </MenuItem>
                  {availableTimes.length > 0 ? (
                    availableTimes.map((slot, index) => (
                      <MenuItem
                        key={index}
                        value={slot.time}
                        disabled={slot.isBooked}
                      >
                        {slot.time} {slot.isBooked ? "(Booked)" : ""}
                      </MenuItem>
                    ))
                  ) : preferredDate ? (
                    <MenuItem disabled>No available slots for selected date</MenuItem>
                  ) : (
                    <MenuItem disabled>Please select a date first</MenuItem>
                  )}
                </Select>
                {preferredDate && availableTimes.length === 0 && (
                  <FormHelperText>No available slots for this date. Please try another date.</FormHelperText>
                )}
              </StyledFormControl>
            </Grid>
            <Grid item xs={12}>
              <StyledTextField
                label="Additional Notes"
                variant="outlined"
                multiline
                rows={4}
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Please let us know any specific requirements or instructions..."
                InputProps={{
                  startAdornment: <NotesIcon sx={{ mr: 1, mt: 1, opacity: 0.6 }} />,
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <StyledButton
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Confirm Booking"
              )}
            </StyledButton>
          </Box>
        </BookingForm>
      </StyledPaper>
    </StyledContainer>
  );
};

export default Booking;