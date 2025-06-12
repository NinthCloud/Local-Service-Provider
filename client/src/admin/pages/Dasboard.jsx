import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Paper,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  People,
  ShoppingCart,
  Star,
  Category,
  PendingActions,
  CheckCircle,
  TrendingDown,
  Assessment,
  Business,
  RateReview,
  LocalOffer
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import newRequest from '../../utils/newRequest';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // State for all dashboard data
  const [dashboardData, setDashboardData] = useState({
    users: { total: 0, regular: 0, providers: 0 },
    pendingProviders: 0,
    orders: { total: 0, recent: [] },
    services: { total: 0, active: 0 },
    reviews: { total: 0, average: 0 },
    categories: { total: 0 },
    loading: true,
    error: null
  });

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true, error: null }));

        // Fetch all data concurrently
        const [
          usersRes,
          regularUsersRes,
          providersRes,
          pendingProvidersRes,
          ordersRes,
          servicesRes,
          reviewsRes,
          categoriesRes
        ] = await Promise.all([
          newRequest.get('/admin/users?limit=1000'),
          newRequest.get('/admin/regular-users?limit=1000'),
          newRequest.get('/admin/providers?limit=1000'),
          newRequest.get('/admin/pending-providers?limit=1000'),
          newRequest.get('/admin/orders?limit=10'),
          newRequest.get('/admin/services?limit=1000'),
          newRequest.get('/admin/reviews?limit=1000'),
          newRequest.get('/admin/categories')
        ]);

        // Calculate average rating
        const reviews = reviewsRes.data.reviews || [];
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + (review.star || 0), 0) / reviews.length 
          : 0;

        setDashboardData({
          users: {
            total: usersRes.data.totalUsers || 0,
            regular: regularUsersRes.data.totalUsers || 0,
            providers: providersRes.data.totalProviders || 0
          },
          pendingProviders: pendingProvidersRes.data.providers?.length || 0,
          orders: {
            total: ordersRes.data.orders?.length || 0,
            recent: ordersRes.data.orders?.slice(0, 5) || []
          },
          services: {
            total: servicesRes.data.totalServices || 0,
            active: servicesRes.data.services?.filter(s => !s.isDeleted).length || 0
          },
          reviews: {
            total: reviews.length,
            average: avgRating
          },
          categories: {
            total: categoriesRes.data.length || 0
          },
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dashboard data'
        }));
      }
    };

    fetchDashboardData();
  }, []);

  // Key metrics for top cards
  const keyMetrics = [
    {
      title: 'Total Users',
      value: dashboardData.users.total,
      icon: <People />,
      color: '#3B82F6',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Orders',
      value: dashboardData.orders.total,
      icon: <ShoppingCart />,
      color: '#10B981',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Active Services',
      value: dashboardData.services.active,
      icon: <LocalOffer />,
      color: '#F59E0B',
      change: '+6%',
      changeType: 'positive'
    },
    {
      title: 'Avg Rating',
      value: dashboardData.reviews.average.toFixed(1),
      icon: <Star />,
      color: '#EF4444',
      change: '+0.3',
      changeType: 'positive'
    }
  ];

  // Data for charts
  const userDistributionData = [
    { name: 'Regular Users', value: dashboardData.users.regular, color: '#3B82F6' },
    { name: 'Providers', value: dashboardData.users.providers, color: '#10B981' }
  ];

  const systemMetricsData = [
    { name: 'Total Services', value: dashboardData.services.total, color: '#3B82F6' },
    { name: 'Active Services', value: dashboardData.services.active, color: '#10B981' },
    { name: 'Categories', value: dashboardData.categories.total, color: '#F59E0B' },
    { name: 'Reviews', value: dashboardData.reviews.total, color: '#8B5CF6' }
  ];

  const monthlyData = [
    { month: 'Jan', users: 120, orders: 80, services: 45 },
    { month: 'Feb', users: 150, orders: 95, services: 52 },
    { month: 'Mar', users: 180, orders: 110, services: 58 },
    { month: 'Apr', users: 200, orders: 125, services: 65 },
    { month: 'May', users: 240, orders: 150, services: 72 },
    { month: 'Jun', users: 280, orders: 180, services: 80 }
  ];

  if (dashboardData.loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CircularProgress size={50} />
            <Typography variant="h6" color="text.secondary">
              Loading Dashboard...
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  if (dashboardData.error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {dashboardData.error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      py: { xs: 2, md: 4 }
    }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3,
            mb: 4,
            p: { xs: 3, md: 4 },
            color: 'white'
          }}
        >
          <Typography 
            variant={isMobile ? "h4" : "h3"} 
            sx={{ 
              fontWeight: 700,
              textAlign: 'center',
              mb: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Admin Dashboard
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              textAlign: 'center',
              opacity: 0.9,
              fontWeight: 300
            }}
          >
            System Overview & Analytics
          </Typography>
        </Paper>

        {/* Key Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {keyMetrics.map((metric, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper 
                elevation={2}
                sx={{ 
                  p: 3,
                  borderRadius: 3,
                  height: '100%',
                  background: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                  <Avatar 
                    sx={{ 
                      backgroundColor: metric.color,
                      width: 48,
                      height: 48
                    }}
                  >
                    {metric.icon}
                  </Avatar>
                  <Chip 
                    label={metric.change}
                    size="small"
                    icon={metric.changeType === 'positive' ? <TrendingUp /> : <TrendingDown />}
                    sx={{
                      backgroundColor: metric.changeType === 'positive' ? '#dcfce7' : '#fee2e2',
                      color: metric.changeType === 'positive' ? '#16a34a' : '#dc2626',
                      fontWeight: 600,
                      border: 'none'
                    }}
                  />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                  {metric.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {metric.title}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* User Distribution Pie Chart */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '400px' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'white' }}>
                User Distribution
              </Typography>
              <ResponsiveContainer width="100%" height="70%">
                <PieChart>
                  <Pie
                    data={userDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {userDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
              <Box display="flex" justifyContent="center" gap={3} mt={2}>
                {userDistributionData.map((item, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={1}>
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        backgroundColor: item.color 
                      }} 
                    />
                    <Typography variant="caption" color="text.secondary">
                      {item.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* System Metrics Bar Chart */}
          <Grid item xs={12} lg={8}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '400px' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'white' }}>
                System Metrics Overview
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={systemMetricsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {systemMetricsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Monthly Trends & Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Monthly Trends Line Chart */}
          <Grid item xs={12} lg={8}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '350px' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'white' }}>
                Monthly Growth Trends
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#3B82F6" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
                  <Area type="monotone" dataKey="orders" stroke="#10B981" fillOpacity={1} fill="url(#colorOrders)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '350px' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'white' }}>
                Quick Stats
              </Typography>
              <Box display="flex" flexDirection="column" gap={3}>
                {/* Service Health */}
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Active Services Rate
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="#10B981">
                      {((dashboardData.services.active / dashboardData.services.total) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(dashboardData.services.active / dashboardData.services.total) * 100} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: '#f1f5f9',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#10B981',
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>

                {/* Rating */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Average Rating
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Star sx={{ color: '#F59E0B', fontSize: '1.2rem' }} />
                    <Typography variant="body1" fontWeight={700} color="white">
                      {dashboardData.reviews.average.toFixed(1)}/5.0
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                {/* Pending Applications */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Pending Applications
                  </Typography>
                  <Chip 
                    label={dashboardData.pendingProviders}
                    size="small"
                    color={dashboardData.pendingProviders > 5 ? "warning" : "success"}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>

                {/* Categories */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Total Categories
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="white">
                    {dashboardData.categories.total}
                  </Typography>
                </Box>

                {/* Total Reviews */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Total Reviews
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="white">
                    {dashboardData.reviews.total}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Footer */}
        <Paper 
          elevation={0} 
          sx={{ 
            background: 'rgba(255,255,255,0.7)', 
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            p: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Last updated: {new Date().toLocaleString()} • Dashboard v2.0
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard;