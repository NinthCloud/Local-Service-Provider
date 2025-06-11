import React, { useRef, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Paper,
  TextField,
  Menu,
  MenuItem,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SortIcon from "@mui/icons-material/Sort";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import GigCard from "../../components/gigCard/GigCard";
import newRequest from "../../utils/newRequest";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";

const Gigs = () => {
  const [page, setPage] = useState(1);
  const gigsPerPage = 12;
  const [locationFilter, setLocationFilter] = useState("");
  const [sort, setSort] = useState("sales");
  const [anchorEl, setAnchorEl] = useState(null);
  const minRef = useRef();
  const maxRef = useRef();

  const { search } = useLocation();
  const queryClient = useQueryClient();
  const category = new URLSearchParams(search).get("cat") || "All Services";
  const providerId = new URLSearchParams(search).get("providerId");


  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["services", locationFilter, sort, page, providerId],
    queryFn: () =>
      newRequest
        .get(
          `/services${search}&min=${minRef.current.value}&max=${maxRef.current.value}&sort=${sort}&location=${locationFilter}&page=${page}&limit=${gigsPerPage}`
        )
        .then((res) => res.data),
  });

  const applyFilters = () => {
    queryClient.invalidateQueries(["services"]);
  };

  const resetFilters = () => {
    setLocationFilter("");
    minRef.current.value = "";
    maxRef.current.value = "";
    setSort("sales");
    queryClient.invalidateQueries(["services"]);
  };

  const getSortLabel = () => {
    switch (sort) {
      case "sales":
        return "Best Selling";
      case "createdAt":
        return "Newest";
      case "HighestRated":
        return "Top Rated";
      case "priceAsc":
        return "Lowest Price";
      case "priceDesc":
        return "Highest Price";
      default:
        return "Best Selling";
    }
  };

  return (
    <Box sx={{ bgcolor: "#f9fafb", minHeight: "100vh" }}>
      <Container
        maxWidth={false}
        sx={{
          maxWidth: "1400px",
          minHeight: "calc(100vh - 160px)",
          py: { xs: 2, md: 4 },
        }}
      >
        {/* Breadcrumbs */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600,
              color: "#475569",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: 0.5 
            }}
          >
            <span style={{ color: "#3b82f6" }}>ServiceHub</span> 
            <span style={{ margin: "0 4px" }}>/</span> 
            <span style={{ color: "#3b82f6" }}>{category}</span>
            <span style={{ margin: "0 4px" }}>/</span>
          </Typography>
        </Box>

        {/* Main Content Card */}
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 2, 
            overflow: "hidden",
            border: "1px solid #e5e7eb",
            mb: 4
          }}
        >
          {/* Header with title */}
          <Box 
            sx={{ 
              bgcolor: "#fff", 
              p: 3, 
              borderBottom: "1px solid #e5e7eb"
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
              {category}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Find the perfect service that matches your needs
            </Typography>
          </Box>

          {/* Filters Section */}
          <Box sx={{ bgcolor: "#f8fafc", p: 3 }}>
            <Grid container spacing={3}>
              {/* Location Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: "#475569" }}>
                  Location
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter city or pincode"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "white",
                      borderRadius: 1.5,
                      "& fieldset": {
                        borderColor: "#e2e8f0",
                      },
                      "&:hover fieldset": {
                        borderColor: "#cbd5e1",
                      },
                    },
                  }}
                />
              </Grid>

              {/* Budget Filter */}
              <Grid item xs={12} sm={6} md={5}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: "#475569" }}>
                  Budget Range
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    inputRef={minRef}
                    size="small"
                    placeholder="Min"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          ₹
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "white",
                        borderRadius: 1.5,
                        "& fieldset": {
                          borderColor: "#e2e8f0",
                        },
                      },
                    }}
                  />
                  <Typography variant="body2" sx={{ lineHeight: 2.5 }}>to</Typography>
                  <TextField
                    inputRef={maxRef}
                    size="small"
                    placeholder="Max"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          ₹
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "white",
                        borderRadius: 1.5,
                        "& fieldset": {
                          borderColor: "#e2e8f0",
                        },
                      },
                    }}
                  />
                </Box>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12} md={3} sx={{ display: "flex", alignItems: "flex-end" }}>
                <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={applyFilters}
                    startIcon={<FilterAltIcon />}
                    sx={{ 
                      bgcolor: "#3b82f6", 
                      '&:hover': { bgcolor: "#2563eb" },
                      borderRadius: 1.5,
                      boxShadow: "none",
                      py: 1
                    }}
                  >
                    Apply
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={resetFilters}
                    startIcon={<RestartAltIcon />}
                    sx={{ 
                      borderColor: "#cbd5e1",
                      color: "#64748b",
                      '&:hover': { 
                        bgcolor: "#f1f5f9",
                        borderColor: "#94a3b8" 
                      },
                      borderRadius: 1.5,
                      py: 1
                    }}
                  >
                    Reset
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Sort Controls */}
        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            mb: 3,
            flexWrap: "wrap",
            gap: 2
          }}
        >
          {data && data.services && (
            <Typography variant="body2" color="text.secondary">
              Showing <strong>{data.services.length}</strong> results
            </Typography>
          )}
          
          <Button
            onClick={(e) => setAnchorEl(e.currentTarget)}
            variant="outlined"
            startIcon={<SortIcon />}
            sx={{ 
              borderColor: "#cbd5e1",
              color: "#64748b",
              '&:hover': { 
                bgcolor: "#f1f5f9",
                borderColor: "#94a3b8" 
              },
              borderRadius: 1.5,
              textTransform: "none",
              px: 2
            }}
          >
            Sort by: <strong style={{ marginLeft: 4 }}>{getSortLabel()}</strong>
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              elevation: 2,
              sx: { 
                mt: 1, 
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                borderRadius: 2,
                minWidth: 200
              },
            }}
          >
            <MenuItem 
              onClick={() => {
                setSort("sales"); 
                setAnchorEl(null);
              }}
              selected={sort === "sales"}
              sx={{ 
                py: 1.5,
                '&:hover': { bgcolor: "#f1f5f9" },
                '&.Mui-selected': { bgcolor: "#e0f2fe", color: "#0369a1" }
              }}
            >
              Best Selling
            </MenuItem>
            <MenuItem 
              onClick={() => {
                setSort("createdAt");
                setAnchorEl(null);
              }}
              selected={sort === "createdAt"}
              sx={{ 
                py: 1.5,
                '&:hover': { bgcolor: "#f1f5f9" },
                '&.Mui-selected': { bgcolor: "#e0f2fe", color: "#0369a1" }
              }}
            >
              Newest
            </MenuItem>
            <MenuItem 
              onClick={() => {
                setSort("HighestRated");
                setAnchorEl(null);
              }}
              selected={sort === "HighestRated"}
              sx={{ 
                py: 1.5,
                '&:hover': { bgcolor: "#f1f5f9" },
                '&.Mui-selected': { bgcolor: "#e0f2fe", color: "#0369a1" }
              }}
            >
              Top Rated
            </MenuItem>
            <MenuItem 
              onClick={() => {
                setSort("priceAsc");
                setAnchorEl(null);
              }}
              selected={sort === "priceAsc"}
              sx={{ 
                py: 1.5,
                '&:hover': { bgcolor: "#f1f5f9" },
                '&.Mui-selected': { bgcolor: "#e0f2fe", color: "#0369a1" }
              }}
            >
              Lowest Price
            </MenuItem>
            <MenuItem 
              onClick={() => {
                setSort("priceDesc");
                setAnchorEl(null);
              }}
              selected={sort === "priceDesc"}
              sx={{ 
                py: 1.5,
                '&:hover': { bgcolor: "#f1f5f9" },
                '&.Mui-selected': { bgcolor: "#e0f2fe", color: "#0369a1" }
              }}
            >
              Highest Price
            </MenuItem>
          </Menu>
        </Box>

        {/* Gig Cards */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 8 }}>
            <CircularProgress sx={{ color: "#3b82f6" }} />
          </Box>
        ) : error ? (
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              textAlign: "center",
              borderRadius: 2,
              border: "1px solid #fee2e2",
              bgcolor: "#fef2f2"
            }}
          >
            <Typography color="error.main" variant="h6">
              Something went wrong
            </Typography>
            <Typography color="error.light" variant="body2" sx={{ mt: 1 }}>
              There was an error loading the gigs. Please try again later.
            </Typography>
          </Paper>
        ) : Array.isArray(data?.services) && data.services.length > 0 ? (
          <Grid container spacing={3}>
            {data.services.map((service) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={service.id}
                sx={{ display: "flex" }}
              >
                <Box sx={{ width: "100%", height: "100%" }}>
                  <GigCard item={service} />
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              textAlign: "center",
              borderRadius: 2,
              border: "1px solid #e5e7eb",
              bgcolor: "#f9fafb"
            }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
              No services found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your filters or check back later for new listings
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={resetFilters}
              sx={{ 
                mt: 3,
                borderRadius: 1.5,
                textTransform: "none",
                px: 3
              }}
            >
              Reset Filters
            </Button>
          </Paper>
        )}

        {/* Pagination */}
        {data?.services && data.services.length > 0 && (
          <Box 
            sx={{ 
              display: "flex", 
              justifyContent: "center", 
              mt: 6, 
              mb: 4
            }}
          >
            <Paper 
              elevation={0}
              sx={{ 
                display: "flex", 
                alignItems: "center",
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                overflow: "hidden"
              }}
            >
              <Button
                size="medium"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                startIcon={<NavigateBeforeIcon />}
                sx={{ 
                  px: 2, 
                  borderRadius: 0,
                  color: page === 1 ? "#cbd5e1" : "#64748b",
                  '&:hover': { bgcolor: "#f1f5f9" },
                  borderRight: "1px solid #e5e7eb",
                  minWidth: 100
                }}
              >
                Previous
              </Button>
              <Box 
                sx={{ 
                  px: 3, 
                  py: 1, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  borderRight: "1px solid #e5e7eb",
                  minWidth: 80
                }}
              >
                <Typography sx={{ fontWeight: 600, color: "#1e293b" }}>
                  {page}
                </Typography>
              </Box>
              <Button
                size="medium"
                onClick={() => setPage(page + 1)}
                endIcon={<NavigateNextIcon />}
                sx={{ 
                  px: 2, 
                  borderRadius: 0,
                  color: "#64748b",
                  '&:hover': { bgcolor: "#f1f5f9" },
                  minWidth: 100
                }}
              >
                Next
              </Button>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Gigs;