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
  IconButton,
  Typography,
  Button,
  TablePagination,
  Box,
  Chip,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Divider,
  useTheme,
  Avatar,
  alpha,
} from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";
import InfoIcon from "@mui/icons-material/Info";
import PersonIcon from "@mui/icons-material/Person";
import newRequest from "../../utils/newRequest";

const ProviderList = () => {
  const [providers, setProviders] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProviders, setTotalProviders] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    fetchProviders(page + 1, rowsPerPage);
  }, [page, rowsPerPage]);

  const fetchProviders = async (currentPage, limit) => {
    try {
      const response = await newRequest.get(`/admin/providers?page=${currentPage}&limit=${limit}`, {
        withCredentials: true,
      });

      setProviders(response.data.providers || []);
      setTotalProviders(response.data.totalProviders || 0);
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  const revokeProvider = async (userId) => {
    try {
      await newRequest.post(`/admin/revoke/${userId}`, {}, { withCredentials: true });
      setProviders(providers.filter((provider) => provider.id !== userId));
    } catch (error) {
      console.error("Error revoking provider status:", error);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Mobile card view for providers
  const MobileProviderCards = () => (
    <Box sx={{ p: 2 }}>
      {providers.length > 0 ? (
        providers.map((provider) => (
          <Card 
            key={provider.id} 
            elevation={2} 
            sx={{ 
              mb: 2, 
              borderRadius: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)'
              }
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    mr: 2 
                  }}
                >
                  <PersonIcon />
                </Avatar>
                <Typography variant="subtitle1" fontWeight="bold">
                  {provider.username}
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    ID:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2" noWrap>
                    {provider.id}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Email:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">
                    {provider.email}
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  component={Link}
                  to={`/admin/providerdetails/${provider.id}`}
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<InfoIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Details
                </Button>
                <Button
                  onClick={() => revokeProvider(provider.id)}
                  variant="outlined"
                  color="warning"
                  size="small"
                  startIcon={<UndoIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Revoke
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card sx={{ p: 3, textAlign: "center", borderRadius: 2 }}>
          <Typography variant="body1" color="text.secondary">
            No approved providers found
          </Typography>
        </Card>
      )}
    </Box>
  );

  // Desktop table view
  const DesktopProviderTable = () => (
    <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2, 
        bgcolor: alpha(theme.palette.primary.main, 0.05),
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
      }}>
        <Typography variant="h6" fontWeight="600" color="primary.main">
          Approved Providers
        </Typography>
        <Chip 
          label={`Total: ${totalProviders}`} 
          color="primary" 
          size="small"
          sx={{ fontSize: '0.75rem' }}
        />
      </Box>
      
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
            <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {providers.length > 0 ? (
            providers.map((provider) => (
              <TableRow 
                key={provider.id}
                sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03) }
                }}
              >
                <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {provider.id}
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{provider.username}</TableCell>
                <TableCell>{provider.email}</TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/admin/providerdetails/${provider.id}`}
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<InfoIcon />}
                    sx={{ mr: 1, borderRadius: 2 }}
                  >
                    View Details
                  </Button>
                  <IconButton 
                    onClick={() => revokeProvider(provider.id)} 
                    color="warning"
                    sx={{ 
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.2) },
                      ml: 1
                    }}
                  >
                    <UndoIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography variant="body1" sx={{ py: 3 }} color="text.secondary">
                  No approved providers found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalProviders}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        sx={{ 
          borderTop: 1, 
          borderColor: 'divider',
          '.MuiTablePagination-toolbar': {
            pr: 2
          },
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            fontSize: '0.875rem'
          }
        }}
      />
    </TableContainer>
  );

  return (
    <Box sx={{ width: '100%', p: { xs: 0, sm: 2 } }}>
      {isMobile ? <MobileProviderCards /> : <DesktopProviderTable />}
    </Box>
  );
};

export default ProviderList;