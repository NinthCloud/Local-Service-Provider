
import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { Card, CardMedia, Box, Typography, Avatar } from "@mui/material";

const ProjectCard = ({ item, onClick }) => {
  // First, find the provider based on the providerId in the service
  const { isLoading: providerLoading, error: providerError, data: providerData } = useQuery({
    queryKey: ["provider", item.providerId],
    queryFn: () =>
      newRequest.get(`/users/provider/${item.providerId}`).then((res) => res.data),
    enabled: !!item.providerId, // Only run if providerId exists
  });

  // Then, find the user based on the userId in the provider data
  const { isLoading: userLoading, error: userError, data: userData } = useQuery({
    queryKey: ["user", providerData?.userId],
    queryFn: () =>
      newRequest.get(`/users/${providerData?.userId}`).then((res) => res.data),
    enabled: !!providerData?.userId, // Only run if provider data is loaded and has userId
  });

  const isLoading = providerLoading || userLoading;
  const error = providerError || userError;

  return (
    <Link to={`/gigs?userId=${providerData?.userId}`} style={{ textDecoration: "none" }}>
      <Card
        onClick={onClick}
        sx={{
          fontFamily: "Montserrat, sans-serif",
          position: "relative",
          margin: "auto",
          height: { xs: 270, sm: 300 },
          width: { xs: "90%", sm: "280px", md: "280px" },
          borderRadius: 2,
          border: "2px solid rgba(0, 123, 255, 0.2)",
          cursor: "pointer",
          boxShadow: "0px 0px 16px -16px rgba(0, 0, 0, 0.59)",
          overflow: "hidden",
          backgroundColor: "#F8F8FF",
          color: "black",
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            transform: "scale(1.05)",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        {/* Cover Image */}
        <CardMedia
          component="img"
          image={item.cover}
          alt={item.title}
          sx={{
            width: "100%",
            height: "70%",
            objectFit: "cover",
          }}
        />

        {/* User Info Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            padding: "10px 15px",
            fontFamily: "Montserrat, sans-serif",
            color: "black",
          }}
        >
          {/* User Avatar */}
          {isLoading ? (
            <Typography variant="body2">Loading...</Typography>
          ) : error ? (
            <Typography variant="body2" color="error">
              Something went wrong
            </Typography>
          ) : (
            <>
              <Avatar
                src={userData?.image || "/img/noavatar.jpg"}
                alt="User Avatar"
                sx={{ width: 40, height: 40 }}
              />
              <Box>
                <Typography
                  variant="h4"
                  fontSize={{ xs: 13, sm: 14 }}
                  fontWeight={500}
                  fontFamily="Montserrat, sans-serif"
                  color="rgba(11, 11, 11, 0.8)"
                  sx={{
                    maxWidth: "200px",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="h6"
                  fontSize={{ xs: 12, sm: 13 }}
                  color="rgba(11, 11, 11, 0.8)"
                  sx={{
                    maxWidth: "200px",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {userData?.username || providerData?.providerName || "Unknown User"}
                </Typography>
                <Typography
                  variant="body1"
                  fontSize={{ xs: 12, sm: 13 }}
                  color="rgba(11, 11, 11, 0.8)"
                  sx={{
                    maxWidth: "200px",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {providerData?.providerName || "Unknown User"}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Card>
    </Link>
  );
};

export default ProjectCard;
