import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Pagination,
  IconButton,
  Tooltip,
  Box,
  Chip,
  Avatar,
  Skeleton,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Rating,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import CommentIcon from "@mui/icons-material/Comment";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import newRequest from "../../utils/newRequest";

const ReviewTable = () => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchReviews();
  }, [page]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await newRequest.get(`/admin/reviews?page=${page}&limit=10`, {
        withCredentials: true,
      });
      setReviews(response.data.reviews);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await newRequest.delete(`/admin/deletereview/${reviewId}`, {
        withCredentials: true,
      });
      setReviews(reviews.filter((review) => review.id !== reviewId)); // Remove from UI
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const formatId = (id) => {
    if (!id) return "";
    
    // Convert to string only for display formatting
    const idStr = id.toString();
    
    // If ID is short enough, just show it all
    if (idStr.length <= 12) return id;
    
    // Get first 6 digits
    const firstPart = Math.floor(id / Math.pow(10, idStr.length - 6));
    
    // Get last 4 digits
    const lastPart = id % 10000;
    
    return `${firstPart}...${lastPart}`;
  };
  // Generate a shortened ID for display
  const shortenId = (id) => {
    return formatId(id);
  };

  // Function to render star rating
  const renderRating = (star) => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Rating value={star} readOnly precision={0.5} size="small" />
        <Box sx={{ ml: 1 }}>{star}</Box>
      </Box>
    );
  };

  // Mobile view as cards
  const renderMobileView = () => {
    if (loading) {
      return Array.from(new Array(3)).map((_, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 1 }} />
        </Box>
      ));
    }

    if (!Array.isArray(reviews) || reviews.length === 0) {
      return (
        <Card variant="outlined" sx={{ textAlign: 'center', p: 3, backgroundColor: 'rgba(0,0,0,0.02)' }}>
          <Typography color="text.secondary">No reviews found</Typography>
        </Card>
      );
    }

    return reviews.map((review) => (
      <Card 
        key={review.id} 
        variant="outlined" 
        sx={{ 
          mb: 2, 
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Chip 
              avatar={<Avatar><StarIcon fontSize="small" /></Avatar>}
              label={review.star}
              color={review.star >= 4 ? "success" : review.star >= 3 ? "info" : "warning"}
              size="small"
            />
            <Tooltip title="Delete Review">
              <IconButton
                onClick={() => deleteReview(review.id)}
                color="error"
                size="small"
                sx={{ ml: 1 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Date:</strong> {formatDate(review.createdAt)}
          </Typography>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>ID:</strong> {shortenId(review.id)}
          </Typography>
          
          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <WorkIcon fontSize="small" sx={{ mr: 0.5 }} />
                {shortenId(review.gigId)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                {shortenId(review.userId)}
              </Typography>
            </Grid>
          </Grid>
          
          <Box sx={{ 
            p: 1.5, 
            backgroundColor: 'rgba(0,0,0,0.02)', 
            borderRadius: 1,
            borderLeft: '3px solid',
            borderColor: 'primary.main',
            mt: 1
          }}>
            <Typography variant="body2">
              {review.desc || "No comment provided"}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    ));
  };

  // Desktop view as table
  const renderDesktopView = () => {
    return (
      <TableContainer component={Paper} elevation={0} variant="outlined">
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
            <TableCell>Date</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Service ID</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from(new Array(5)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                </TableRow>
              ))
            ) : Array.isArray(reviews) && reviews.length > 0 ? (
              reviews.map((review) => (
                <TableRow 
                  key={review.id}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
                    },
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Tooltip title={review.createdAt}>
                      <span>{formatDate(review.createdAt)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Tooltip title={review.id}>
                      <span>{shortenId(review.id)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Tooltip title={review.gigId}>
                      <span>{shortenId(review.gigId)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Tooltip title={review.userId}>
                      <span>{shortenId(review.userId)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {renderRating(review.star)}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Tooltip title={review.desc || "No comment provided"}>
                      <span>{review.desc || "No comment provided"}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Delete Review">
                      <IconButton
                        onClick={() => deleteReview(review.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ py: 3 }}>
                    <Typography color="text.secondary">No reviews found</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Card sx={{ 
      overflow: 'hidden',
      boxShadow: theme.shadows[1],
      transition: 'box-shadow 0.3s ease',
      '&:hover': {
        boxShadow: theme.shadows[3],
      },
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex',
        alignItems: 'center',
        borderBottom: 1, 
        borderColor: 'divider',
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
      }}>
        <CommentIcon sx={{ mr: 1.5, color: 'primary.main' }} />
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'medium' }}>
          All Reviews
        </Typography>
        <Chip 
          label={`Total: ${reviews.length} of ${totalPages * 10}`}
          size="small"
          sx={{ ml: 2 }}
        />
      </Box>

      <Box sx={{ p: 0, flexGrow: 1, overflowX: 'auto' }}>
        {isMobile ? renderMobileView() : renderDesktopView()}
      </Box>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        p: 2,
        borderTop: 1,
        borderColor: 'divider'
      }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(event, value) => setPage(value)}
          color="primary"
          size={isMobile ? "small" : "medium"}
          showFirstButton
          showLastButton
        />
      </Box>
    </Card>
  );
};

export default ReviewTable;