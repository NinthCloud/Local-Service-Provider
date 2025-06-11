import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
  TablePagination,
  Button,
  Card,
  CardContent,
  Chip,
  useTheme,
  useMediaQuery,
  Grid,
  Skeleton,
  Divider,
} from "@mui/material";
import newRequest from "../../utils/newRequest";
import InfoIcon from "@mui/icons-material/Info";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchOrders(page + 1, rowsPerPage);
  }, [page, rowsPerPage]);

  const fetchOrders = async (page, limit) => {
    try {
      const response = await newRequest.get(`/admin/orders?page=${page}&limit=${limit}`, {
        withCredentials: true,
      });
      setOrders(response.data.orders);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'in progress':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        padding: { xs: 2, md: 4 },
        maxWidth: "1200px", 
        margin: "0 auto",
      }}>
        <Card elevation={3} sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              <Skeleton width="180px" />
            </Typography>
            <Grid container spacing={2}>
              {[...Array(5)].map((_, index) => (
                <Grid item xs={12} key={index}>
                  <Skeleton variant="rounded" height={80} />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        padding: { xs: 2, md: 4 },
        maxWidth: "1200px", 
        margin: "0 auto",
        display: "flex",
        justifyContent: "center", 
        alignItems: "center",
        minHeight: "50vh"
      }}>
        <Card elevation={3} sx={{ borderRadius: 2, width: "100%", bgcolor: "#FFF5F5" }}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography color="error" variant="h6">
              {error}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={() => fetchOrders(page + 1, rowsPerPage)}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Mobile and tablet card view
  if (isMobile || isTablet) {
    return (
      <Box sx={{ 
        padding: { xs: 2, sm: 3 },
        maxWidth: "1200px", 
        margin: "0 auto"
      }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          <ArticleOutlinedIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Bookings List
        </Typography>
        
        <Grid container spacing={2}>
          {orders.length > 0 ? (
            orders.map((order) => (
              <Grid item xs={12} key={order.id}>
                <Card elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
                  <Box sx={{ p: 2, bgcolor: theme.palette.primary.main, color: "white" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Booking ID: {order.id}
                    </Typography>
                  </Box>
                  <CardContent>
                    <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Customer:</Typography>
                        <Typography variant="body1" gutterBottom noWrap>{order.createdAt}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Customer:</Typography>
                        <Typography variant="body1" gutterBottom noWrap>{order.buyerId}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Provider:</Typography>
                        <Typography variant="body1" gutterBottom noWrap>{order.sellerId}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Amount:</Typography>
                        <Typography variant="body1" fontWeight="bold">₹{order.price}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Status:</Typography>
                        <Chip 
                          label={order.status} 
                          color={getStatusColor(order.status)} 
                          size="small" 
                          sx={{ mt: 0.5 }}
                        />
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                    <Button
                      component={Link}
                      to={`/admin/orderdetails/${order.id}`}
                      variant="outlined"
                      color="primary"
                      fullWidth
                      startIcon={<InfoIcon />}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Card elevation={1} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 4, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    No orders found.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <TablePagination
            component="div"
            count={totalPages * rowsPerPage}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Box>
    );
  }

  // Desktop table view
  return (
    <Box sx={{ 
      padding: { md: 3, lg: 4 },
      maxWidth: "1200px", 
      margin: "0 auto"
    }}>
      <Card elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h5" fontWeight={600}>
            <ArticleOutlinedIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Bookings List
          </Typography>
        </Box>
        <TableContainer sx={{ maxHeight: "calc(100vh - 240px)" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: "black" }}>Booking ID</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "black" }}>Customer ID</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "black" }}>Provider ID</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "black" }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "black" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "black" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow 
                    key={order.id}
                    sx={{ 
                      '&:hover': { 
                        bgcolor: theme.palette.action.hover 
                      } 
                    }}
                  >
                    <TableCell sx={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {order.id}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {order.buyerId}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {order.sellerId}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>₹{order.price}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status} 
                        color={getStatusColor(order.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        component={Link}
                        to={`/admin/orderdetails/${order.id}`}
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<InfoIcon />}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No orders found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <TablePagination
            component="div"
            count={totalPages * rowsPerPage}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                margin: 0,
              },
            }}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default Orders;