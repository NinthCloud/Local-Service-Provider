import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Button,
  Pagination,
  Chip,
  useTheme,
  useMediaQuery,
  Skeleton,
  Card,
  CardContent,
  Stack,
  Divider,
  Alert,
  Avatar,
  Tooltip,
  alpha,
  Container,
  Badge,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  TextField,
  InputAdornment,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlineIcon from "@mui/icons-material/AlternateEmail";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import newRequest from "../../utils/newRequest";

const ProviderTable = () => {
  const [providers, setProviders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProviders, setTotalProviders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(10);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));

  useEffect(() => {
    fetchPendingProviders();
  }, [page, limit]);

  const fetchPendingProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await newRequest.get(
        `/admin/pending-providers?page=${page}&limit=${limit}`,
        {
          withCredentials: true,
        }
      );
      setProviders(response.data.providers);
      setTotalPages(response.data.totalPages);
      setTotalProviders(
        response.data.totalCount || response.data.providers.length
      );
    } catch (error) {
      console.error("Error fetching pending providers:", error);
      setError("Failed to load provider applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const approveProvider = async (userId) => {
    try {
      await newRequest.post(
        `/admin/approve/${userId}`,
        {},
        { withCredentials: true }
      );
      setProviders(providers.filter((provider) => provider.id !== userId));
      if (providers.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchPendingProviders();
      }
    } catch (error) {
      console.error("Error approving provider:", error);
      setError("Failed to approve provider. Please try again.");
    }
  };

  const rejectProvider = async (userId) => {
    try {
      await newRequest.post(
        `/admin/reject/${userId}`,
        {},
        { withCredentials: true }
      );
      setProviders(providers.filter((provider) => provider.id !== userId));
      if (providers.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchPendingProviders();
      }
    } catch (error) {
      console.error("Error rejecting provider:", error);
      setError("Failed to reject provider. Please try again.");
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
    setPage(1); // Reset to first page when changing items per page
  };

  // Generate a consistent color based on username for the avatar
  const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
  };

  // Calculate displayed range of providers
  const calculateRange = () => {
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, totalProviders);
    return `${start}-${end} of ${totalProviders}`;
  };

  // Skeleton loader for table
  const TableSkeleton = () => (
    <>
      {[1, 2, 3, 4, 5].map((item) => (
        <TableRow key={item}>
          {[1, 2, 3, 4].map((cell) => (
            <TableCell key={cell}>
              <Skeleton animation="wave" height={40} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );

  // Card view for mobile and tablet
  const ResponsiveCardView = () => (
    <Stack spacing={2}>
      {loading ? (
        [1, 2, 3].map((item) => (
          <Card key={item} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Skeleton
                animation="wave"
                height={30}
                width="40%"
                sx={{ mb: 1 }}
              />
              <Skeleton
                animation="wave"
                height={20}
                width="70%"
                sx={{ mb: 1 }}
              />
              <Skeleton
                animation="wave"
                height={20}
                width="60%"
                sx={{ mb: 2 }}
              />
              <Skeleton animation="wave" height={40} width="100%" />
            </CardContent>
          </Card>
        ))
      ) : providers.length > 0 ? (
        providers.map((provider) => (
          <Card
            key={provider.id}
            elevation={2}
            sx={{
              borderRadius: 2,
              borderLeft: "4px solid",
              borderLeftColor: theme.palette.primary.main,
              transition: "all 0.2s ease",
              "&:hover": {
                boxShadow: 6,
                transform: "translateY(-3px)",
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                <Avatar
                  sx={{
                    bgcolor: stringToColor(provider.username),
                    color: theme.palette.getContrastText(
                      stringToColor(provider.username)
                    ),
                    width: 40,
                    height: 40,
                    mr: 2,
                  }}
                >
                  {provider.username.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {provider.username}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <EmailOutlineIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {provider.email}
                    </Typography>
                  </Stack>
                </Box>
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mt: 2,
                }}
              >
                <Tooltip title="Application ID">
                  <Chip
                    label={`${Math.floor(provider.id / 10000)}...`}
                    size="small"
                    color="default"
                    icon={<MoreTimeIcon fontSize="small" />}
                    variant="outlined"
                  />
                </Tooltip>

                <Stack direction="row" spacing={1}>
                  <Button
                    component={Link}
                    to={`/admin/providerdetails/${provider.id}`}
                    variant="outlined"
                    size="small"
                    startIcon={<InfoIcon />}
                  >
                    Details
                  </Button>

                  <Tooltip title="Approve Provider">
                    <IconButton
                      onClick={() => approveProvider(provider.id)}
                      size="small"
                      sx={{
                        color: theme.palette.success.main,
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        "&:hover": {
                          bgcolor: alpha(theme.palette.success.main, 0.2),
                        },
                      }}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Reject Provider">
                    <IconButton
                      onClick={() => rejectProvider(provider.id)}
                      size="small"
                      sx={{
                        color: theme.palette.error.main,
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        "&:hover": {
                          bgcolor: alpha(theme.palette.error.main, 0.2),
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            py: 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <PersonOutlineIcon sx={{ fontSize: 48, color: "text.disabled" }} />
            <Typography align="center" color="text.secondary" variant="body1">
              No pending provider applications
            </Typography>
          </Box>
        </Card>
      )}
    </Stack>
  );

  // Enhanced pagination controls
  const PaginationControls = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "center", sm: "center" },
        gap: 2,
        mt: 2,
        p: 2,
        borderTop: 1,
        borderColor: "divider",
        bgcolor: alpha(theme.palette.primary.light, 0.05),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <FormControl
          variant="outlined"
          size="small"
          sx={{
            minWidth: { xs: 120, sm: 100 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        >
          <InputLabel id="rows-per-page-label">Per Page</InputLabel>
          <Select
            labelId="rows-per-page-label"
            value={limit}
            onChange={handleLimitChange}
            label="Per Page"
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: { xs: "none", sm: "block" },
          }}
        >
          Showing {calculateRange()}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {!isMobile && (
          <Typography variant="body2" color="text.secondary">
            Page: {page} of {totalPages}
          </Typography>
        )}

        <Stack direction="row" spacing={0.5}>
          <Tooltip title="First Page">
            <span>
              <IconButton
                size="small"
                disabled={page === 1 || loading}
                onClick={() => handlePageChange(null, 1)}
                sx={{
                  borderRadius: 1.5,
                  color: theme.palette.primary.main,
                  "&.Mui-disabled": {
                    color: theme.palette.action.disabled,
                  },
                }}
              >
                <KeyboardDoubleArrowLeftIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Previous Page">
            <span>
              <IconButton
                size="small"
                disabled={page === 1 || loading}
                onClick={() => handlePageChange(null, page - 1)}
                sx={{
                  borderRadius: 1.5,
                  color: theme.palette.primary.main,
                  "&.Mui-disabled": {
                    color: theme.palette.action.disabled,
                  },
                }}
              >
                <KeyboardArrowLeftIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          {!isMobile && (
            <TextField
              size="small"
              value={page}
              inputProps={{
                min: 1,
                max: totalPages,
                style: { textAlign: "center" },
              }}
              onChange={(e) => {
                const newPage = parseInt(e.target.value);
                if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
                  handlePageChange(null, newPage);
                }
              }}
              sx={{
                width: 50,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                },
              }}
            />
          )}

          <Tooltip title="Next Page">
            <span>
              <IconButton
                size="small"
                disabled={page === totalPages || loading}
                onClick={() => handlePageChange(null, page + 1)}
                sx={{
                  borderRadius: 1.5,
                  color: theme.palette.primary.main,
                  "&.Mui-disabled": {
                    color: theme.palette.action.disabled,
                  },
                }}
              >
                <KeyboardArrowRightIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Last Page">
            <span>
              <IconButton
                size="small"
                disabled={page === totalPages || loading}
                onClick={() => handlePageChange(null, totalPages)}
                sx={{
                  borderRadius: 1.5,
                  color: theme.palette.primary.main,
                  "&.Mui-disabled": {
                    color: theme.palette.action.disabled,
                  },
                }}
              >
                <KeyboardDoubleArrowRightIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        width: "100%",
        px: { xs: 1, sm: 2, md: 3 },
        py: 2,
      }}
    >
      <Card
        elevation={3}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          background: theme.palette.background.paper,
          transition: "all 0.3s ease",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            p: { xs: 2, md: 3 },
            borderBottom: 1,
            borderColor: "divider",
            background: `linear-gradient(145deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold">
            Pending Provider Applications
          </Typography>
          <Badge
            badgeContent={totalProviders}
            color="error"
            max={99}
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.primary.main,
                fontWeight: "bold",
              },
            }}
          >
            <Chip
              label="Pending"
              size={isMobile ? "small" : "medium"}
              sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.2),
                color: "white",
                fontWeight: "bold",
                backdropFilter: "blur(4px)",
              }}
            />
          </Badge>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              m: 2,
              borderRadius: 2,
              border: `1px solid ${theme.palette.error.light}`,
            }}
          >
            {error}
          </Alert>
        )}

        <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, flexGrow: 1 }}>
          {isMobile || isTablet ? (
            <ResponsiveCardView />
          ) : (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                maxHeight: "60vh",
                overflowY: "auto",
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Table stickyHeader sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: alpha(
                          theme.palette.primary.light,
                          0.1
                        ),
                        color: theme.palette.primary.dark,
                      }}
                    >
                      ID
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: alpha(
                          theme.palette.primary.light,
                          0.1
                        ),
                        color: theme.palette.primary.dark,
                      }}
                    >
                      Username
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: alpha(
                          theme.palette.primary.light,
                          0.1
                        ),
                        color: theme.palette.primary.dark,
                      }}
                    >
                      Email
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: alpha(
                          theme.palette.primary.light,
                          0.1
                        ),
                        color: theme.palette.primary.dark,
                      }}
                      align="center"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableSkeleton />
                  ) : Array.isArray(providers) && providers.length > 0 ? (
                    providers.map((provider) => (
                      <TableRow
                        key={provider.id}
                        sx={{
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.light, 0.05),
                          },
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        <TableCell
                          sx={{
                            maxWidth: 150,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            borderLeft: `3px solid ${stringToColor(
                              provider.username
                            )}`,
                          }}
                        >
                          <Tooltip title={provider.id}>
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: "monospace" }}
                            >
                              {provider.id.toString().length >
                              (isLargeScreen ? 16 : 12)
                                ? Math.floor(
                                    provider.id /
                                      Math.pow(
                                        10,
                                        provider.id.toString().length -
                                          (isLargeScreen ? 16 : 12)
                                      )
                                  ) + "..."
                                : provider.id}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: stringToColor(provider.username),
                                color: theme.palette.getContrastText(
                                  stringToColor(provider.username)
                                ),
                              }}
                            >
                              {provider.username.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography fontWeight="medium">
                              {provider.username}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <EmailOutlineIcon fontSize="small" color="action" />
                            {provider.email}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                          >
                            <Tooltip title="View Provider Details">
                              <Button
                                component={Link}
                                to={`/admin/providerdetails/${provider.id}`}
                                variant="outlined"
                                color="primary"
                                size="small"
                                startIcon={<InfoIcon />}
                                sx={{
                                  borderRadius: 6,
                                  textTransform: "none",
                                  minWidth: 32,
                                  px: isTablet ? 1 : 2,
                                }}
                              >
                                {isTablet ? "" : "Details"}
                              </Button>
                            </Tooltip>

                            <Tooltip title="Approve Provider">
                              <IconButton
                                onClick={() => approveProvider(provider.id)}
                                size="small"
                                sx={{
                                  color: theme.palette.success.main,
                                  bgcolor: alpha(
                                    theme.palette.success.main,
                                    0.1
                                  ),
                                  "&:hover": {
                                    bgcolor: alpha(
                                      theme.palette.success.main,
                                      0.2
                                    ),
                                  },
                                }}
                              >
                                <CheckIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Reject Provider">
                              <IconButton
                                onClick={() => rejectProvider(provider.id)}
                                size="small"
                                sx={{
                                  color: theme.palette.error.main,
                                  bgcolor: alpha(theme.palette.error.main, 0.1),
                                  "&:hover": {
                                    bgcolor: alpha(
                                      theme.palette.error.main,
                                      0.2
                                    ),
                                  },
                                }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <PersonOutlineIcon
                            sx={{ fontSize: 48, color: "text.disabled" }}
                          />
                          <Typography color="text.secondary" variant="body1">
                            No pending provider applications
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {totalPages > 0 && <PaginationControls />}
      </Card>
    </Box>
  );
};

export default ProviderTable;
