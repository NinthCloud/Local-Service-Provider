import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { 
  Box, 
  CssBaseline, 
  Typography, 
  IconButton, 
  useMediaQuery,
  AppBar,
  Toolbar as MuiToolbar
} from "@mui/material";
import Sidebar from "./Sidebar";
import AdminTheme from "./AdminTheme";
import { ThemeProvider } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import getCurrentUser from "../utils/getCurrentUser";

const AdminDashboard = () => {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();

    // If no currentUser, redirect to login page
    if (!currentUser?.id || currentUser?.role !== "admin") {
      navigate("/login");
    } else {
    }
  }, [navigate]);
  
  // Responsive breakpoints
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:960px)');
  
  // Auto-close sidebar on small screens
  useEffect(() => {
    if (isTablet) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isTablet]);
  
  // Handle mobile drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ThemeProvider theme={AdminTheme}>
      <Box sx={{ display: "flex", backgroundColor: "background.default", minHeight: "100vh" }}>
        <CssBaseline />
        
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sidebar open={open} setOpen={setOpen} />
        )}
        
        {/* Mobile Sidebar (Drawer) */}
        {isMobile && (
          <Sidebar 
            open={mobileOpen} 
            setOpen={setMobileOpen}
            isMobile={true} 
            onClose={() => setMobileOpen(false)} 
          />
        )}
        
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            transition: isMobile ? 'none' : "margin 0.3s ease, padding 0.3s ease",
            marginLeft: isMobile ? 0 : (open ? "240px" : "70px"),
            width: isMobile ? '100%' : 'auto',
            overflow: "hidden",
          }}
        >
          {/* Top Navigation Bar */}
          <AppBar 
            position="sticky" 
            elevation={0}
            sx={{ 
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(30,30,30,0.8)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <MuiToolbar sx={{ padding: { xs: '8px 16px', sm: '16px 24px' } }}>
              {/* Mobile Menu Button */}
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600,
                  backgroundImage: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                  backgroundClip: 'text',
                  color: 'transparent',
                  fontSize: { xs: '1.1rem', sm: '1.5rem' }
                }}
              >
                Dash Control
              </Typography>
            </MuiToolbar>
          </AppBar>
          
          {/* Content Area */}
          <Box 
            sx={{ 
              padding: { xs: '16px', sm: '20px', md: '24px' },
              height: { xs: 'calc(100vh - 57px)', sm: 'calc(100vh - 73px)' },
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '6px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
              }
            }}
          >
            <Outlet /> {/* Renders child routes */}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;