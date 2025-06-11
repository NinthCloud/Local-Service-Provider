import React from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Typography,
  Rating,
} from "@mui/material";

const Review = ({ review }) => {
  // Get user data from the review object directly
  const username = review.user?.username || "Unknown user";
  const userImage = review.user?.img || "/img/noavatar.jpg";
  
  // Format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Card sx={{ my: 2, p: 2, backgroundColor: "#f5e8dd", borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={userImage} alt={username} sx={{ width: 50, height: 50 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(review.createdAt)}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={1} mt={2}>
          <Rating value={review.star} precision={0.5} readOnly />
          <Typography variant="body2" fontWeight="bold">
            {review.star}
          </Typography>
        </Box>

        <Typography variant="body1" mt={2}>
          {review.desc}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Review;