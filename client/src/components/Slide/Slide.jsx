import React from "react";
import Slider from "react-slick";
import PropTypes from "prop-types";
import { Box, IconButton } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

// Import Slick styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Custom Next Arrow Button
const NextArrow = (props) => {
  const { onClick } = props;
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        backgroundColor: "rgba(248, 246, 246, 0.8)",
        borderRadius: "50%",
        width: 40,
        height: 40,
        zIndex: 10,
        "&:hover": { backgroundColor: "white" },
      }}
    >
      <ArrowForward />
    </IconButton>
  );
};

// Custom Previous Arrow Button
const PrevArrow = (props) => {
  const { onClick } = props;
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: "absolute",
        left: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        backgroundColor: "rgba(248, 246, 246, 0.8)",
        borderRadius: "50%",
        width: 40,
        height: 40,
        zIndex: 10,
        "&:hover": { backgroundColor: "white" },
      }}
    >
      <ArrowBack />
    </IconButton>
  );
};

const Slide = ({ children, slidesToShow = 3, arrowsScroll = 2 }) => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow,
    slidesToScroll: arrowsScroll,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1200,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 900,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        position: "relative",
        padding: { xs: "50px 8px", md: "100px 8px" },
        borderRadius: "20px",
        width: "100%",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "1400px", minWidth: "300px" }}>
        <Slider {...settings}>{children}</Slider>
      </Box>
    </Box>
  );
};

// Prop Type Validation
Slide.propTypes = {
  children: PropTypes.node.isRequired,
  slidesToShow: PropTypes.number,
  arrowsScroll: PropTypes.number,
};

// Default Props
Slide.defaultProps = {
  slidesToShow: 3,
  arrowsScroll: 2,
};

export default Slide;
