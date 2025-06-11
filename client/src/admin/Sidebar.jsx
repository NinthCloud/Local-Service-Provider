import { useState, useEffect } from "react";
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Divider, 
  Typography, 
  Box, 
  Tooltip,
  useMediaQuery,
  Badge,
  Avatar
} from "@mui/material";
import { 
  Dashboard, 
  People, 
  Business, 
  Event, 
  BarChart, 
  Reviews, 
  Settings, 
  Menu, 
  ChevronLeft, 
  Home, 
  PeopleAlt, 
  PeopleOutline, 
  FeaturedPlayList,
  KeyboardArrowDown,
  Category
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";

const drawerWidth = 240;

const Sidebar = ({ open, setOpen, isMobile = false, onClose = () => {} }) => {
  const location = useLocation();
  const isSmallScreen = useMediaQuery('(max-width:900px)');
  
  const menuItems = [
    { 
      text: "Home", 
      icon: <Home />, 
      path: "/",
      active: location.pathname === "/"
    },
    { 
      text: "Applications", 
      icon: <BarChart />, 
      path: "/admin/applications",
      active: location.pathname === "/admin/applications",
     
    },
    { 
      text: "All Users", 
      icon: <PeopleOutline />, 
      path: "/admin/settings",
      active: location.pathname === "/admin/settings"
    },
    { 
      text: "Regular Users", 
      icon: <People />, 
      path: "/admin/users",
      active: location.pathname === "/admin/users"
    },
    { 
      text: "Providers", 
      icon: <Business />, 
      path: "/admin/providers",
      active: location.pathname === "/admin/providers",
    },
    { 
      text: "Services", 
      icon: <FeaturedPlayList />, 
      path: "/admin",
      active: location.pathname === "/admin"
    },
    { 
      text: "Bookings", 
      icon: <Event />, 
      path: "/admin/bookings",
      active: location.pathname === "/admin/bookings"
    },
    { 
      text: "Reviews", 
      icon: <Reviews />, 
      path: "/admin/reviews",
      active: location.pathname === "/admin/reviews"
    },
    { 
      text: "Category management", 
      icon: <Category />, 
      path: "/admin/handlecategory",
      active: location.pathname === "/admin/handlecategory"
    }
  ];
  
  const toggleDrawer = () => {
    // Fixed: Handle both mobile and desktop cases correctly
    if (isMobile) {
      onClose();  // Always call onClose for mobile view
    } else {
      setOpen(!open);  // Toggle open state for desktop view
    }
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={open}  // Fixed: Use open consistently for both mobile and desktop
      onClose={onClose}  // Fixed: Always use onClose for consistency
      sx={{
        width: open ? drawerWidth : 70,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? drawerWidth : 70,
          boxSizing: "border-box",
          transition: "width 0.3s, box-shadow 0.2s",
          overflowX: "hidden",
          background: "linear-gradient(180deg, #141425 0%, #0D0D15 100%)",
          boxShadow: open ? "0 0 20px rgba(0,0,0,0.2)" : "none",
          border: "none",
        },
      }}
    >
      {/* Sidebar Header */}
      <Box sx={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        p: open ? 3 : 1.5, 
        pb: open ? 2 : 1 
      }}>
        {open ? (
          <>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                backgroundImage: 'linear-gradient(45deg, #2D7FF9, #18D7C7)',
                backgroundClip: 'text',
                color: 'transparent',
                mb: 1
              }}
            >
              Dash Control
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Admin Dashboard
            </Typography>
          </>
        ) : (
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700,
              backgroundImage: 'linear-gradient(45deg, #2D7FF9, #18D7C7)',
              backgroundClip: 'text',
              color: 'transparent',
              fontSize: '1.5rem',
              mb: 1
            }}
          >
            D
          </Typography>
        )}
        
        {/* Admin profile summary */}
        {open && (
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            width: "100%",
            backgroundColor: "rgba(255,255,255,0.03)",
            borderRadius: 2,
            p: 1.5,
            mb: 1
          }}>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40,
                border: '2px solid rgba(45, 127, 249, 0.5)',
              }}
            />
            <Box sx={{ ml: 1.5 }}>
              <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
                Admin User
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
      
      <Divider sx={{ 
        borderColor: 'rgba(255,255,255,0.08)', 
        mx: open ? 2 : 1,
        mb: 1
      }} />

      {/* Menu Categories */}
      {open && (
        <Typography 
          variant="overline" 
          sx={{ 
            px: 3, 
            py: 1, 
            display: 'block', 
            color: 'text.secondary',
            fontSize: '0.65rem',
            letterSpacing: '0.08em'
          }}
        >
          MAIN NAVIGATION
        </Typography>
      )}

      {/* Sidebar Menu */}
      <List sx={{ px: open ? 1.5 : 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <Tooltip title={open ? "" : item.text} placement="right">
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={isMobile ? onClose : undefined}
                sx={{
                  minHeight: 46,
                  justifyContent: open ? "initial" : "center",
                  px: open ? 2 : 1,
                  borderRadius: 2,
                  position: 'relative',
                  backgroundColor: item.active ? 'rgba(45, 127, 249, 0.08)' : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': { 
                    backgroundColor: item.active ? 'rgba(45, 127, 249, 0.12)' : 'rgba(255,255,255,0.04)'
                  },
                  '&::before': item.active ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '20%',
                    height: '60%',
                    width: '4px',
                    backgroundColor: 'primary.main',
                    borderRadius: '0 4px 4px 0',
                    display: open ? 'block' : 'none'
                  } : {}
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 0, 
                    mr: open ? 2 : 0, 
                    justifyContent: "center", 
                    color: item.active ? 'primary.main' : 'text.secondary',
                    transition: 'color 0.2s'
                  }}
                >
                  {item.notifications ? (
                    <Badge 
                      badgeContent={item.notifications} 
                      color="primary"
                      sx={{
                        '& .MuiBadge-badge': {
                          right: -3,
                          top: 3,
                          border: '2px solid #141420',
                          padding: '0 4px',
                        }
                      }}
                    >
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                {open && (
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      fontWeight: item.active ? 600 : 400,
                      variant: 'body2',
                      color: item.active ? 'text.primary' : 'text.secondary'
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      {/* Bottom section with toggle button */}
      <Box sx={{ 
        mt: 'auto', 
        p: 2, 
        display: 'flex',
        justifyContent: open ? 'flex-end' : 'center'
      }}>
        <IconButton 
          onClick={toggleDrawer}  // This will now properly close on mobile
          sx={{ 
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 2,
            width: 36,
            height: 36,
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' }
          }}
        >
          {open ? <ChevronLeft /> : <Menu />}
        </IconButton>
      </Box>
    </Drawer>
  );
};

export default Sidebar;