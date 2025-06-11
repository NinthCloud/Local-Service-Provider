import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
} from "@mui/material";
import newRequest from "../../utils/newRequest";
import Review from "../review/Review";
import getCurrentUser from "../../utils/getCurrentUser";

const Reviews = ({ serviceId }) => {
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();
  const [reviewableBookings, setReviewableBookings] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  
  // Fetch reviews
  const { isLoading, error, data: reviews } = useQuery({
    queryKey: ["reviews", serviceId],
    queryFn: () => newRequest.get(`/reviews/${serviceId}`).then((res) => res.data),
  });

  // Check if user can review this service
  const { data: reviewableStatus } = useQuery({
    queryKey: ["reviewable", serviceId],
    queryFn: () => 
      currentUser 
        ? newRequest.get(`/reviews/${serviceId}/reviewable`).then((res) => res.data)
        : { canReview: false },
    enabled: !!currentUser,
  });

  // Update reviewable bookings when data changes
  useEffect(() => {
    if (reviewableStatus?.reviewableBookings?.length > 0) {
      setReviewableBookings(reviewableStatus.reviewableBookings);
      // Set the first booking as default selected
      setSelectedBookingId(reviewableStatus.reviewableBookings[0].bookingId);
    }
  }, [reviewableStatus]);

  // Mutation for submitting a review
  const mutation = useMutation({
    mutationFn: (review) => newRequest.post("/reviews", review),
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews"]);
      queryClient.invalidateQueries(["reviewable"]);
      setReviewText("");
      setRating(5);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!currentUser) {
      setErrorMessage("You must be logged in to leave a review.");
      return;
    }

    if (!reviewableStatus?.canReview) {
      setErrorMessage("You must have a confirmed booking for this service to leave a review.");
      return;
    }

    if (!selectedBookingId) {
      setErrorMessage("Please select a booking to review.");
      return;
    }

    setErrorMessage(""); // Clear error message if eligible
    mutation.mutate({ 
      serviceId, 
      desc: reviewText, 
      star: rating, 
      bookingId: selectedBookingId 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Reviews
      </Typography>

      {isLoading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Something went wrong loading reviews!</Alert>
      ) : (
        <>
          {Array.isArray(reviews) && reviews.length > 0 ? (
            reviews.map((review) => <Review key={review.id} review={review} />)
          ) : (
            <Alert severity="info">No reviews yet.</Alert>
          )}
        </>
      )}

      <Card sx={{ mt: 4, p: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Add a Review
          </Typography>

          {!currentUser ? (
            <Alert severity="warning">Please log in to leave a review.</Alert>
          ) : !reviewableStatus?.canReview ? (
            <Alert severity="info">
              You need to have a confirmed booking for this service to leave a review.
            </Alert>
          ) : (
            <>
              {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                {/* {reviewableBookings.length > 0 && (
                  <FormControl fullWidth>
                    <InputLabel id="booking-select-label">Select Booking</InputLabel>
                    <Select
                      labelId="booking-select-label"
                      value={selectedBookingId}
                      label="Select Booking"
                      onChange={(e) => setSelectedBookingId(e.target.value)}
                      required
                    >
                      {reviewableBookings.map((booking) => (
                        <MenuItem key={booking.bookingId} value={booking.bookingId}>
                          Booking from {formatDate(booking.bookingDate || booking.confirmationDate)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )} */}

                <TextField
                  label="Write your review"
                  variant="outlined"
                  multiline
                  rows={4}
                  fullWidth
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />

                <FormControl sx={{ width: 200 }}>
                  <InputLabel id="rating-select-label">Rating</InputLabel>
                  <Select
                    labelId="rating-select-label"
                    value={rating}
                    label="Rating"
                    onChange={(e) => setRating(e.target.value)}
                    required
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <MenuItem key={num} value={num}>
                        {num} {num === 1 ? 'Star' : 'Stars'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  sx={{ alignSelf: "flex-end", width: 120 }}
                  disabled={mutation.isLoading}
                >
                  {mutation.isLoading ? <CircularProgress size={24} /> : "Submit"}
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Reviews;