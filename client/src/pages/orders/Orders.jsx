import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import newRequest from "../../utils/newRequest.js";
import getCurrentUser from "../../utils/getCurrentUser";

// Material UI imports
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Pagination,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Grid,
  Chip,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  alpha,
} from "@mui/material";

// Icons
import {
  CheckCircleOutline as ConfirmIcon,
  CancelOutlined as CancelIcon,
  VisibilityOutlined as ViewIcon,
  RateReviewOutlined as FeedbackIcon,
  FilterAltOutlined as FilterIcon,
  Payment,
  Money,
  DoneAllSharp,
  MonetizationOn,
} from "@mui/icons-material";

const Orders = () => {
  const currentUser = getCurrentUser();
  const queryClient = useQueryClient();
  const [showProviderOrders, setShowProviderOrders] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [page, setPage] = useState(1);
  const ordersPerPage = 10;
  const [isProvider, setIsProvider] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Fetch user's provider status directly from the server
  const { data: providerData, isLoading: isProviderStatusLoading } = useQuery({
    queryKey: ["providerStatus", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      try {
        // Check if the user is a provider by querying the endpoint
        const res = await newRequest.get(`/users/${currentUser.id}`);
        return {
          isProvider: res.data.isSeller && res.data.approvedByAdmin,
          providerId: res.data.isSeller && res.data.approvedByAdmin ? res.data.id : null
        };
      } catch (error) {
        console.error("Error fetching provider status:", error);
        return { isProvider: false, providerId: null };
      }
    },
    enabled: !!currentUser?.id,
  });

  // Update provider status when data is fetched
  useEffect(() => {
    if (providerData) {
      setIsProvider(providerData.isProvider);
      // Reset provider view if the user is no longer a provider
      if (!providerData.isProvider && showProviderOrders) {
        setShowProviderOrders(false);
      }
    }
  }, [providerData, showProviderOrders]);

  const { isLoading, error, data } = useQuery({
    queryKey: ["bookings", page, currentUser?.id, showProviderOrders],
    queryFn: async () => {
      if (!currentUser) return { bookings: [], totalPages: 0 };

      // Let backend know if we're filtering by provider role
      const res = await newRequest.get(
        `/bookings?page=${page}&limit=${ordersPerPage}&userId=${currentUser.id}&showProviderOrders=${showProviderOrders}`
      );
      return res.data;
    },
    refetchOnWindowFocus: true,
    enabled: !!currentUser,
  });

  const confirmOrderMutation = useMutation({
    mutationFn: (bookingId) =>
      newRequest.patch(`/bookings/${bookingId}/confirm`),
    onError: (err) => console.error("Error confirming order:", err),
    onSuccess: () => queryClient.invalidateQueries(["bookings"]),
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (bookingId) =>
      newRequest.patch(`/bookings/${bookingId}/cancel`),
    onError: (err) => console.error("Error canceling order:", err),
    onSuccess: () => queryClient.invalidateQueries(["bookings"]),
  });

  const isExpired = (booking) => {
    if (!booking.preferredDate || !booking.preferredTime) return false;

    const orderDateTime = new Date(
      `${booking.preferredDate}T${booking.preferredTime}:00`
    );
    const now = new Date();

    return (
      orderDateTime <= now &&
      (booking.status === "Pending")
    );
  };

  
  const filteredOrders = React.useMemo(() => {
    if (!Array.isArray(data?.bookings)) return [];

    return data.bookings
      .map((booking) => ({
        ...booking,
        status: isExpired(booking) ? "Expired" : booking.status,
      }))
      .filter((booking) => {
        // Apply only status filter since role filtering is handled by backend
        if (selectedStatus !== "All" && booking.status !== selectedStatus)
          return false;
        return true;
      });
  }, [data?.bookings, selectedStatus]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Confirmed":
        return "success";
      case "Canceled":
        return "error";
      case "Expired":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case "Pending":
        return alpha(theme.palette.warning.main, 0.1);
      case "Confirmed":
        return alpha(theme.palette.success.main, 0.1);
      case "Canceled":
        return alpha(theme.palette.error.main, 0.1);
      case "Expired":
        return alpha(theme.palette.grey[500], 0.1);
      default:
        return alpha(theme.palette.grey[500], 0.1);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const renderMobileView = () => (
    <Grid container spacing={2}>
      {filteredOrders.length > 0 ? (
        filteredOrders.map((booking) => (
          <Grid item xs={12} key={booking.id}>
            <Card
              elevation={2}
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 6,
                },
              }}
            >
              <Box sx={{ position: "relative" }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={booking.img}
                  alt={booking.title}
                  sx={{ objectFit: "cover" }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    bgcolor: getStatusBackgroundColor(booking.status),
                    borderRadius: 5,
                    px: 1.5,
                    py: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color={`${getStatusColor(booking.status)}.main`}
                  >
                    {booking.status}
                  </Typography>
                </Box>
              </Box>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" gutterBottom noWrap>
                  {booking.title}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    <strong>Price:</strong>
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    ₹{booking.price}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Date:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(booking.createdAt)}
                  </Typography>
                </Box>
              </CardContent>
              <Divider />
              <CardActions
                sx={{ px: 2, py: 1.5, justifyContent: "space-between" }}
              >
                <Box>
                  {booking.status === "Pending" &&
                    !isExpired(booking) &&
                    showProviderOrders && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<ConfirmIcon />}
                        onClick={() => confirmOrderMutation.mutate(booking.id)}
                        sx={{ mr: 1, borderRadius: 2 }}
                      >
                        Confirm
                      </Button>
                    )}
                  {(booking.status === "Pending" ||
                    booking.status === "Confirmed") &&
                    !isExpired(booking) && ((!showProviderOrders) || // Always show for buyer
                    (showProviderOrders && !booking.isCompleted)) &&(
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<CancelIcon />}
                        onClick={() => cancelOrderMutation.mutate(booking.id)}
                        sx={{ borderRadius: 2 }}
                      >
                        Cancel
                      </Button>
                    )}
                </Box>
                <Box>
                  <Button
                    variant="outlined"
                    color="info"
                    size="small"
                    startIcon={<ViewIcon />}
                    component={Link}
                    to={`/booking/${booking.id}`}
                    sx={{ mr: 1, borderRadius: 2 }}
                  >
                    Details
                  </Button>
                  {booking.status === "Confirmed" &&
                    !isExpired(booking) &&
                    currentUser.id === booking.buyerId && booking.isCompleted &&(
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        startIcon={<FeedbackIcon />}
                        component={Link}
                        to={`/gig/${booking.serviceId}`}
                        sx={{ borderRadius: 2 }}
                      >
                        Review
                      </Button>
                    )}
                    {booking.status === "Confirmed" &&
                    !isExpired(booking) &&
                    currentUser.id === booking.buyerId && !booking.isCompleted &&(
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        startIcon={<MonetizationOn />}
                        component={Link}
                        to={`/pay/${booking.id}`}
                        sx={{ borderRadius: 2 }}
                      >
                        Pay now
                      </Button>
                    )}
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))
      ) : (
        <Grid item xs={12}>
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No orders match your filters
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try changing your filter settings
            </Typography>
          </Box>
        </Grid>
      )}
    </Grid>
  );

  const renderTableView = () => (
    <TableContainer
      component={Paper}
      elevation={2}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <TableCell sx={{ fontWeight: "bold" }}>Service</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Price</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
            <TableCell align="center" sx={{ fontWeight: "bold" }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((booking) => (
              <TableRow
                key={booking.id}
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  },
                  transition: "background-color 0.2s",
                }}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                      variant="rounded"
                      src={booking.img}
                      alt={booking.title}
                      sx={{ width: 56, height: 56, mr: 2, borderRadius: 2 }}
                    />
                    <Typography variant="body1">{booking.title}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body1"
                    fontWeight="medium"
                    color="primary.main"
                  >
                    ₹{booking.price}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(booking.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={booking.status}
                    color={getStatusColor(booking.status)}
                    size="small"
                    sx={{
                      borderRadius: 1.5,
                      px: 0.5,
                      bgcolor: getStatusBackgroundColor(booking.status),
                      fontWeight: "medium",
                      color: "black",
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box
                    sx={{ display: "flex", justifyContent: "center", gap: 1 }}
                  >
                    {booking.status === "Pending" &&
                      !isExpired(booking) &&
                      showProviderOrders && (
                        <Tooltip title="Confirm Order">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() =>
                              confirmOrderMutation.mutate(booking.id)
                            }
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                              },
                            }}
                          >
                            <ConfirmIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                    {(booking.status === "Pending" ||
                      booking.status === "Confirmed") &&
                      !isExpired(booking) && ((!showProviderOrders) || // Always show for buyer
                      (showProviderOrders && !booking.isCompleted)) &&(
                        <Tooltip title="Cancel Order">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() =>
                              cancelOrderMutation.mutate(booking.id)
                            }
                            sx={{
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              "&:hover": {
                                bgcolor: alpha(theme.palette.error.main, 0.2),
                              },
                            }}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                    <Tooltip title="View Details">
                      <IconButton
                        color="info"
                        size="small"
                        component={Link}
                        to={`/booking/${booking.id}`}
                        sx={{
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          "&:hover": {
                            bgcolor: alpha(theme.palette.info.main, 0.2),
                          },
                        }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {booking.status === "Confirmed" &&
                      !isExpired(booking) &&
                      currentUser.id === booking.buyerId && booking.isCompleted && (
                        <Tooltip title="Write Feedback">
                          <IconButton
                            color="secondary"
                            size="small"
                            component={Link}
                            to={`/gig/${booking.serviceId}`}
                            sx={{
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              "&:hover": {
                                bgcolor: alpha(
                                  theme.palette.secondary.main,
                                  0.2
                                ),
                              },
                            }}
                          >
                            <FeedbackIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {booking.status === "Confirmed" &&
                      !isExpired(booking) &&
                      currentUser.id === booking.buyerId && !booking.isCompleted && (
                        <Tooltip title="Make payment now">
                          <IconButton
                            color="secondary"
                            size="small"
                            component={Link}
                            to={`/pay/${booking.id}`}
                            sx={{
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              "&:hover": {
                                bgcolor: alpha(
                                  theme.palette.secondary.main,
                                  0.2
                                ),
                              },
                            }}
                          >
                            <MonetizationOn fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                  </Box>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5}>
                <Box
                  sx={{
                    textAlign: "center",
                    py: 6,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    No orders match your filters
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Try changing your filter settings
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Show loading screen while provider status is loading
  if (isProviderStatusLoading && currentUser) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 8,
          bgcolor: alpha(theme.palette.background.paper, 0.5),
          borderRadius: 2,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        py: 4,
        bgcolor: alpha(theme.palette.background.default, 0.8),
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, textAlign: isTablet ? "left" : "center" }}>
          <Typography
            variant={isTablet ? "h5" : "h4"}
            component="h1"
            fontWeight="bold"
            color="primary.main"
            gutterBottom
          >
            My Bookings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {showProviderOrders
              ? "Manage bookings from your clients"
              : "Track your bookings and appointments"}
          </Typography>
        </Box>

        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 8,
              bgcolor: alpha(theme.palette.background.paper, 0.5),
              borderRadius: 2,
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 2,
              boxShadow: 2,
            }}
          >
            <Typography variant="body1">Something went wrong!</Typography>
            <Typography variant="body2">Error: {error.message}</Typography>
          </Alert>
        ) : (
          <>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                display: "flex",
                flexDirection: isTablet ? "column" : "row",
                gap: 2,
                alignItems: isTablet ? "stretch" : "center",
                justifyContent: "space-between",
                bgcolor: alpha(theme.palette.background.paper, 0.8),
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FilterIcon color="action" />
                <Typography variant="subtitle1" fontWeight="medium">
                  Filters
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: isTablet ? "column" : "row",
                  gap: 2,
                  width: isTablet ? "100%" : "auto",
                  alignItems: isTablet ? "stretch" : "center",
                }}
              >
                {/* Only show the provider toggle if the user is actually a provider */}
                {isProvider && (
                  <ToggleButtonGroup
                    value={showProviderOrders}
                    exclusive
                    onChange={(_, newValue) => {
                      if (newValue !== null) {
                        setShowProviderOrders(newValue);
                      }
                    }}
                    aria-label="order view"
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      flexWrap: "wrap",
                      "& .MuiToggleButton-root": {
                        borderRadius: "4px",
                        px: 3,
                      },
                    }}
                  >
                    <ToggleButton value={true} aria-label="provider orders">
                      As Provider
                    </ToggleButton>
                    <ToggleButton value={false} aria-label="buyer orders">
                      As Buyer
                    </ToggleButton>
                  </ToggleButtonGroup>
                )}

                <FormControl
                  sx={{
                    minWidth: 150,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "4px",
                    },
                  }}
                  size={isMobile ? "small" : "medium"}
                >
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    id="status-filter"
                    value={selectedStatus}
                    label="Status"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Confirmed">Confirmed</MenuItem>
                    <MenuItem value="Canceled">Canceled</MenuItem>
                    <MenuItem value="Expired">Expired</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Paper>

            {isMobile ? renderMobileView() : renderTableView()}

            {filteredOrders.length > 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={data?.totalPages || 1}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    "& .MuiPaginationItem-root": {
                      borderRadius: "4px",
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default Orders;