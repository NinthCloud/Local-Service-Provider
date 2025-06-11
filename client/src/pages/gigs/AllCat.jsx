import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Box,
  Pagination,
  Container,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Skeleton,
  Chip,
  useTheme,
  useMediaQuery,
  Paper,
  Fade,
  Divider
} from "@mui/material";
import CategoryIcon from "@mui/icons-material/Category";
import WorkIcon from "@mui/icons-material/Work";

function AllCat() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [isActive, setIsActive] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Adjust grid size based on screen size
  const getGridSize = () => {
    if (isMobile) return { xs: 1, sm: 1 };
    if (isTablet) return { xs: 1, sm: 2 };
    return { xs: 1, sm: 2, md: 3, lg: 4 };
  };

  // Fetch categories on component mount or when pagination changes
  useEffect(() => {
    fetchCategories();
  }, [page, pageSize]);

  // API Calls
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await newRequest.get(
        `/categories/categories?page=${page}&limit=${pageSize}`
      );

      // Check if the response has pagination structure
      if (response.data.categories) {
        setCategories(response.data.categories);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        // Fallback for old API format
        setCategories(response.data);
        // Estimate total pages based on array length
        setTotalPages(Math.ceil(response.data.length / pageSize));
      }
    } catch (error) {
      setError("Failed to fetch categories. Please try again.");
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle items per page change
  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setPage(1);
  };

  const handleClick = (category, e) => {
    // For mobile touch interactions
    if ("ontouchstart" in window && !isActive) {
      e.preventDefault();
      setIsActive(category.id);
      setTimeout(() => setIsActive(false), 3000);
    }
  };

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array.from(new Array(pageSize)).map((_, index) => (
      <Grid item xs={1} sm={4} md={4} lg={3} key={`skeleton-${index}`}>
        <Skeleton
          variant="rectangular"
          height={140}
          sx={{ borderRadius: "8px 8px 0 0" }}
        />
        <Skeleton variant="text" height={40} sx={{ mt: 1 }} />
        <Skeleton variant="text" height={20} />
        <Skeleton variant="text" height={20} />
      </Grid>
    ));
  };

  // Function to get total service count
  const getTotalServiceCount = () => {
    return categories.reduce((total, category) => total + (category.serviceCount || 0), 0);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          borderRadius: 2, 
          mb: 4, 
          background: theme.palette.primary.main,
          color: "white"
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
          <CategoryIcon sx={{ mr: 1, fontSize: 28 }} />
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
          >
            Explore Categories
          </Typography>
        </Box>
        <Typography 
          variant="subtitle1" 
          align="center"
          sx={{ opacity: 0.9, maxWidth: "600px", mx: "auto" }}
        >
          Discover all our specialized categories to find the perfect services for your needs
        </Typography>
      </Paper>

      {/* Controls section */}
      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          mb: 3, 
          flexDirection: { xs: "column", sm: "row" },
          gap: 2
        }}
      >
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: { xs: "center", sm: "flex-start" } }}>
          <Chip 
            label={`${categories.length} categories`} 
            color="primary" 
            variant="outlined" 
            icon={<CategoryIcon />}
          />
          {!loading && categories.length > 0 && (
            <Chip 
              label={`${getTotalServiceCount()} services`} 
              color="secondary" 
              variant="outlined"
            />
          )}
        </Box>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Items per page</InputLabel>
          <Select
            value={pageSize}
            onChange={handlePageSizeChange}
            label="Items per page"
          >
            <MenuItem value={8}>8 items</MenuItem>
            <MenuItem value={12}>12 items</MenuItem>
            <MenuItem value={24}>24 items</MenuItem>
            <MenuItem value={48}>48 items</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {loading ? (
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 1, sm: 8, md: 12, lg: 12 }}
        >
          {renderSkeletons()}
        </Grid>
      ) : error ? (
        <Paper 
          sx={{ 
            textAlign: "center", 
            p: 5, 
            borderRadius: 2,
            backgroundColor: theme.palette.error.light,
            color: theme.palette.error.contrastText
          }}
        >
          <Typography>{error}</Typography>
        </Paper>
      ) : (
        <>
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 1, sm: 8, md: 12, lg: 12 }}
          >
            {categories.map((category) => (
              <Grid item xs={1} sm={4} md={4} lg={3} key={category.id}>
                <Fade in={true} timeout={500}>
                  <Link
                    to={`/gigs?cat=${encodeURIComponent(category.name)}`}
                    style={{ textDecoration: "none" }}
                    onClick={(e) => handleClick(category, e)}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 2,
                        overflow: "hidden",
                        transition: "all 0.3s ease-in-out",
                        position: "relative",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: "0 12px 20px rgba(0,0,0,0.15)",
                          "& .MuiCardMedia-root": {
                            transform: "scale(1.05)",
                          },
                        },
                        backgroundColor: isActive === category.id 
                          ? theme.palette.action.selected 
                          : "white",
                      }}
                    >
                      <Box sx={{ overflow: "hidden", position: "relative" }}>
                        <CardMedia
                          component="img"
                          height="160"
                          image={category.cover || "/img/no.jpg"}
                          alt={category.name}
                          sx={{ 
                            objectFit: "cover",
                            transition: "transform 0.5s ease",
                          }}
                        />
                        <Box 
                          sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            width: "100%",
                            background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                            p: 1,
                            display: "flex",
                            justifyContent: "flex-end"
                          }}
                        >
                          <Chip 
                            label={`${category.serviceCount || 0} services`} 
                            size="small"
                            sx={{ 
                              backgroundColor: "rgba(255,255,255,0.9)",
                              fontWeight: "bold",
                              fontSize: "0.7rem",
                              color: theme.palette.primary.dark
                            }}
                          />
                        </Box>
                      </Box>
                      
                      <CardContent sx={{ flexGrow: 1, p: 2 }}>
                        <Typography
                          gutterBottom
                          variant="h6"
                          component="h2"
                          fontWeight="bold"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {category.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            minHeight: "40px"
                          }}
                        >
                          {category.description || "No description available"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Link>
                </Fade>
              </Grid>
            ))}
          </Grid>

          {/* Show message if no categories */}
          {categories.length === 0 && !loading && (
            <Paper 
              sx={{ 
                textAlign: "center", 
                p: 5, 
                borderRadius: 2,
                backgroundColor: theme.palette.info.light,
                color: theme.palette.info.contrastText
              }}
            >
              <Typography variant="h6">No categories found</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Try adjusting your search criteria or check back later
              </Typography>
            </Paper>
          )}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <Box 
              sx={{ 
                display: "flex", 
                justifyContent: "center", 
                mt: 4,
                pb: 2,
                overflowX: "auto",
                width: "100%"
              }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? "small" : "medium"}
                showFirstButton={!isMobile}
                showLastButton={!isMobile}
                siblingCount={isMobile ? 0 : 1}
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

export default AllCat;