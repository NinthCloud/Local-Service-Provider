import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardMedia, Typography, Box } from "@mui/material";

const CatCard = ({ item }) => {
  // State to track touch/hover state for mobile compatibility
  const [isActive, setIsActive] = useState(false);

  // Handle touch start for mobile devices
  const handleTouchStart = () => {
    setIsActive(true);
  };

  // Handle touch end for mobile devices
  const handleTouchEnd = () => {
    // Keep the state active for a moment before resetting
    setTimeout(() => setIsActive(false), 300);
  };

  // Navigate only if not showing the title (for mobile)
  const handleClick = (e) => {
    // If this is the first tap on mobile and we're showing the title,
    // prevent navigation to show the title first
    if (!isActive && ('ontouchstart' in window)) {
      e.preventDefault();
    }
  };

  // Function to handle long titles
  const formatTitle = (title) => {
    // If the title is longer than 12 characters on small screens, truncate it
    if (title.length > 12) {
      // For very small screens, we might want even shorter text
      return {
        full: title,
        short: title.length > 15 ? `${title.substring(0, 10)}...` : title
      };
    }
    return { full: title, short: title };
  };

  const { full: fullTitle, short: shortTitle } = formatTitle(item.title);

  return (
    <Link 
      to={`/gigs?cat=${encodeURIComponent(item.title)}`} 
      style={{ textDecoration: "none" }}
      onClick={handleClick}
    >
      <Card
        // sx={{
        //   position: "relative",
        //   width: { xs: 175, sm: 200, md: 225 },
        //   height: { xs: 175, sm: 200, md: 225 },
        //   margin: "auto",
        //   backgroundColor: "#176B87",
        //   color: "white",
        //   borderRadius: "50%",
        //   border: "2px solid rgba(0, 123, 255, 0.2)",
        //   boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        //   overflow: "hidden",
        //   cursor: "pointer",
        //   transition: "transform 0.3s ease-in-out",
        //   display: "flex",
        //   justifyContent: "center",
        //   alignItems: "center",
        //   "&:hover": {
        //     transform: "scale(1.05)",
        //     boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
        //   },
        //   // Show overlay on hover for desktop AND when isActive for mobile
        //   "&:hover .overlay, .overlay.active": {
        //     opacity: 1,
        //   },
        //   // Blur image on hover for desktop AND when isActive for mobile
        //   "&:hover .cat-image, .cat-image.active": {
        //     filter: "blur(3px)",
        //   },
        // }}

        sx={{
          position: "relative",
          width: { xs: 175, sm: 200, md: 225 },
          height: { xs: 175, sm: 200, md: 225 },
          margin: "auto",
          backgroundColor: "#176B87",
          color: "white",
          borderRadius: "50%",
          border: "2px solid rgba(0, 123, 255, 0.2)",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          cursor: "pointer",
          transition: "transform 0.3s ease-in-out",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          "&:hover": {
            transform: "scale(1.05)",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
          },
          // Always show overlay
          "& .overlay": {
            position: "absolute",
            zIndex: 2,
            textAlign: "center",
            opacity: 1,
            color: "#fff",
            padding: "0 10px",
          },
          // Always blur the image
          "& .cat-image": {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(5px)",
            transition: "filter 0.3s ease-in-out",
          },
        }}

        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsActive(true)}
        onMouseLeave={() => setIsActive(false)}
      >
        {/* Category Image */}
        <CardMedia
          component="img"
          image={item.img}
          alt={item.title}
          className={`cat-image ${isActive ? 'active' : ''}`}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
            transition: "filter 0.3s ease-in-out",
          }}
        />

        {/* Bottom label for mobile - now with better text handling */}
        {/* <Box
          sx={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            padding: "5px 2px",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            textAlign: "center",
            borderBottomLeftRadius: "50%",
            borderBottomRightRadius: "50%",
            display: { xs: "block", sm: "none" },
            // Add word-wrap properties to handle long text
            wordWrap: "break-word",
            overflow: "hidden",
          }}
        >
          <Typography 
            variant="caption" 
            color="white"
            sx={{ 
              fontSize: { xs: '0.65rem', sm: '0.75rem' },
              lineHeight: 1.1,
              display: "block",
              maxHeight: "2.2em", // Limit to roughly 2 lines
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {shortTitle}
          </Typography>
        </Box> */}

        {/* Hover/Touch Overlay for Title - now with better text handling */}
        <Box
          className={`overlay ${isActive ? 'active' : ''}`}
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            borderRadius: "50%",
            opacity: 0,
            transition: "opacity 0.3s ease-in-out",
            padding: 2, // Add padding to keep text away from edges
          }}
        >
          <Typography 
            variant="h6" 
            fontWeight={600} 
            color="white"
            align="center"
            sx={{
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
              maxWidth: "90%", // Prevent text from stretching to edges
              wordBreak: "break-word", // Allow word breaks for long words
              overflowWrap: "break-word",
              hyphens: "auto"
            }}
          >
            {fullTitle}
          </Typography>
        </Box>
      </Card>
    </Link>
  );
};

export default CatCard;