import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  TextField,
  InputAdornment,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Container,
  Collapse,
  CircularProgress,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ExploreIcon from "@mui/icons-material/Explore";
import PersonIcon from "@mui/icons-material/Person";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LogoutIcon from "@mui/icons-material/Logout";
import WorkIcon from "@mui/icons-material/Work";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import newRequest from "../../utils/newRequest";
import getCurrentUser from "../../utils/getCurrentUser";
import { AddModerator, AdminPanelSettingsRounded, Category, CategoryOutlined } from "@mui/icons-material";

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  
  // State for current user data
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 900px)");
  const isSmallMobile = useMediaQuery("(max-width: 600px)");

  // Get stored user for initial check
  const storedUser = getCurrentUser();

  // Fetch current user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      if (!storedUser) {
        setLoading(false);
        return;
      }

      try {
        const response = await newRequest.get(`/users/${storedUser.id}`);
        setUserData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err);
        // Fallback to stored user data if fetch fails
        setUserData(storedUser);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    navigate(`/gigs?search=${searchInput.trim().toLowerCase()}`);
    window.location.reload();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleLogout = async () => {
    try {
      await newRequest.post("/auth/logout");
      localStorage.removeItem("currentUser");
      setUserData(null);
      setOpenMenu(null);
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  const toggleSearch = () => {
    setSearchExpanded(!searchExpanded);
  };

  // Check if user is admin
  const isAdmin = userData?.role === "admin";
  
  // Check if user is an approved service provider
  const isApprovedServiceProvider = userData?.isSeller && userData?.approvedByAdmin;

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "white",
        color: "#333",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            display: "flex",
            flexDirection: isSmallMobile ? "column" : "row",
            justifyContent: "space-between",
            width: "100%",
            padding: isSmallMobile ? "12px 0" : "8px 0",
            gap: isSmallMobile ? 2 : 0,
          }}
        >
          {/* Logo and Navigation Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            {/* Logo */}
            <Box display="flex" alignItems="center">
              <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{
                    fontFamily: "Montserrat, sans-serif",
                    background: "#164863",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "0.5px",
                  }}
                >
                  ServiceHub<span style={{ color: "#164863" }}>.</span>
                </Typography>
              </Link>
            </Box>

            {/* Search Bar - Appears in desktop between logo and navigation */}
            {!isMobile && searchExpanded && (
              <Box
                sx={{
                  flex: 1,
                  mx: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder='Try "Haircut under 1000"'
                  sx={{
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px 0 0 8px",
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "transparent",
                        borderRight: "none",
                      },
                      "&:hover fieldset": {
                        borderColor: "#164863",
                        borderRight: "none",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#164863",
                        borderRight: "none",
                      },
                      borderRadius: "8px 0 0 8px",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#666" }} />
                      </InputAdornment>
                    ),
                  }}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoFocus={searchExpanded}
                />
                <Button
                  sx={{
                    height: "40px",
                    minWidth: "40px",
                    backgroundColor: "#164863",
                    color: "white",
                    borderRadius: "0 8px 8px 0",
                    "&:hover": { bgcolor: "#164863" },
                    padding: "8px 12px",
                  }}
                  onClick={handleSearch}
                >
                  <SearchIcon fontSize="small" />
                </Button>
                <IconButton
                  size="small"
                  onClick={toggleSearch}
                  sx={{ ml: 1, color: "#666" }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {/* Navigation Section */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {/* Desktop Navigation */}
              {!isMobile && (
                <Box display="flex" alignItems="center" gap={2}>
                  {/* Search Icon - Now on the left of Explore button */}
                  <IconButton
                    onClick={toggleSearch}
                    sx={{
                      color: "#4F6F52",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      padding: "8px",
                      "&:hover": {
                        backgroundColor: "164863",
                      },
                      display: searchExpanded ? "none" : "flex",
                    }}
                  >
                    <SearchIcon />
                  </IconButton>

                  {/* Show Admin button only if user is admin */}
                  {loading ? (
                    <CircularProgress size={24} sx={{ mx: 1 }} />
                  ) : (
                    <>
                      {isAdmin && (
                        <Button
                          component={Link}
                          to="/admin"
                          startIcon={<AdminPanelSettingsRounded />}
                          sx={{
                            color: "#333",
                            fontWeight: 500,
                            fontFamily: "Montserrat, sans-serif",
                            "&:hover": {
                              backgroundColor: "rgba(79, 111, 82, 0.08)",
                            },
                          }}
                        >
                          Admin
                        </Button>
                      )}

                      <Button
                        component={Link}
                        to="/categories"
                        startIcon={<CategoryOutlined />}
                        sx={{
                          color: "#333",
                          fontWeight: 500,
                          fontFamily: "Montserrat, sans-serif",
                          "&:hover": {
                            backgroundColor: "rgba(79, 111, 82, 0.08)",
                          },
                        }}
                      >
                        Categories
                      </Button>

                      <Button
                        component={Link}
                        to="/gigs?cat"
                        startIcon={<ExploreIcon />}
                        onClick={() => (window.location.href = "/gigs?cat")} // Forces reload
                        sx={{
                          color: "#333",
                          fontWeight: 500,
                          fontFamily: "Montserrat, sans-serif",
                          "&:hover": {
                            backgroundColor: "rgba(79, 111, 82, 0.08)",
                          },
                        }}
                      >
                        Explore
                      </Button>

                      {!userData ? (
                        <>
                          <Button
                            component={Link}
                            to="/login"
                            startIcon={<LoginIcon />}
                            sx={{
                              color: "#333",
                              fontWeight: 500,
                              fontFamily: "Montserrat, sans-serif",
                              "&:hover": {
                                backgroundColor: "rgba(79, 111, 82, 0.08)",
                              },
                            }}
                          >
                            Sign in
                          </Button>
                          <Button
                            component={Link}
                            to="/register"
                            variant="contained"
                            startIcon={<PersonAddIcon />}
                            sx={{
                              backgroundColor: "#164863",
                              color: "white",
                              fontWeight: 500,
                              fontFamily: "Montserrat, sans-serif",
                              "&:hover": { bgcolor: "#164863" },
                              borderRadius: "8px",
                            }}
                          >
                            Register
                          </Button>
                        </>
                      ) : (
                        <IconButton
                          onClick={(e) => setOpenMenu(e.currentTarget)}
                          sx={{
                            border: "2px solid #f0f0f0",
                            padding: "4px",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              border: "2px solid #164863",
                            },
                          }}
                        >
                          <Avatar
                            src={userData.image || "/img/noavatar.jpg"}
                            sx={{ width: 32, height: 32 }}
                          />
                        </IconButton>
                      )}
                    </>
                  )}
                </Box>
              )}

              {/* Mobile Search Icon + Menu Button */}
              {isMobile && (
                <Box sx={{ display: "flex", gap: 1 }}>
                  {isSmallMobile && (
                    <IconButton
                      onClick={toggleSearch}
                      sx={{
                        backgroundColor: "#f5f5f5",
                        color: "#4F6F52",
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      {searchExpanded ? <CloseIcon /> : <SearchIcon />}
                    </IconButton>
                  )}
                  <IconButton
                    onClick={() => setMobileMenuOpen(true)}
                    color="inherit"
                    sx={{
                      backgroundColor: "#f5f5f5",
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>

          {/* Mobile Search Bar - Collapsible on small mobile */}
          {isSmallMobile && (
            <Collapse in={searchExpanded} sx={{ width: "100%", mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder='Try "Haircut under 1000"'
                  sx={{
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px 0 0 8px",
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "transparent",
                        borderRight: "none",
                      },
                      "&:hover fieldset": {
                        borderColor: "#164863",
                        borderRight: "none",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#164863",
                        borderRight: "none",
                      },
                      borderRadius: "8px 0 0 8px",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#666" }} />
                      </InputAdornment>
                    ),
                  }}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoFocus
                />
                <Button
                  sx={{
                    height: "40px",
                    minWidth: "40px",
                    backgroundColor: "#164863",
                    color: "white",
                    borderRadius: "0 8px 8px 0",
                    "&:hover": { bgcolor: "#164863" },
                  }}
                  onClick={handleSearch}
                >
                  <SearchIcon fontSize="small" />
                </Button>
              </Box>
            </Collapse>
          )}
        </Toolbar>
      </Container>

      {/* User Menu */}
      <Menu
        anchorEl={openMenu}
        open={Boolean(openMenu)}
        onClose={() => setOpenMenu(null)}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: "8px",
            minWidth: "200px",
            mt: 1.5,
            "& .MuiMenuItem-root": {
              fontFamily: "Montserrat, sans-serif",
              py: 1.5,
            },
          },
        }}
      >
        {isApprovedServiceProvider && (
          <MenuItem
            component={Link}
            to="/myGigs"
            onClick={() => setOpenMenu(null)}
          >
            <ListItemIcon>
              <WorkIcon fontSize="small" sx={{ color: "#164863" }} />
            </ListItemIcon>
            <ListItemText primary="My Services" />
          </MenuItem>
        )}
        <MenuItem
          component={Link}
          to="/profile"
          onClick={() => setOpenMenu(null)}
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" sx={{ color: "#164863" }} />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>
        <MenuItem
          component={Link}
          to="/wishlist"
          onClick={() => setOpenMenu(null)}
        >
          <ListItemIcon>
            <FavoriteIcon fontSize="small" sx={{ color: "#164863" }} />
          </ListItemIcon>
          <ListItemText primary="Wishlist" />
        </MenuItem>
        <MenuItem
          component={Link}
          to="/orders"
          onClick={() => setOpenMenu(null)}
        >
          <ListItemIcon>
            <ShoppingBagIcon fontSize="small" sx={{ color: "#164863" }} />
          </ListItemIcon>
          <ListItemText primary="Bookings" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: "#f44336" }} />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 300 },
            borderTopLeftRadius: { xs: "16px", sm: 0 },
            borderBottomLeftRadius: { xs: "16px", sm: 0 },
          },
        }}
      >
        <Box sx={{ padding: 2, height: "100%" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              fontFamily="Montserrat, sans-serif"
            >
              Menu
            </Typography>
            <IconButton
              onClick={() => setMobileMenuOpen(false)}
              sx={{ color: "#666" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress size={36} />
            </Box>
          ) : (
            <>
              {userData && (
                <Box sx={{ display: "flex", alignItems: "center", mb: 3, px: 1 }}>
                  <Avatar
                    src={userData.image || "/img/noavatar.jpg"}
                    sx={{
                      width: 50,
                      height: 50,
                      mr: 2,
                      border: "2px solid #164863",
                    }}
                  />
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {userData.username || "User"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {userData.email || ""}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Divider sx={{ mb: 2 }} />

              <List>
                {isAdmin && (
                  <ListItem
                    component={Link}
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    sx={{
                      borderRadius: "8px",
                      mb: 1,
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                  >
                    <ListItemIcon>
                      <AddModerator sx={{ color: "#164863" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Admin"
                      primaryTypographyProps={{
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: 500,
                      }}
                    />
                  </ListItem>
                )}

                <ListItem
                  component={Link}
                  to="/categories"
                  onClick={() => setMobileMenuOpen(false)}
                  sx={{
                    borderRadius: "8px",
                    mb: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                >
                  <ListItemIcon>
                    <Category sx={{ color: "#164863" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Categories"
                    primaryTypographyProps={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 500,
                    }}
                  />
                </ListItem>

                <ListItem
                  component={Link}
                  to="/gigs?cat"
                  onClick={() => setMobileMenuOpen(false)}
                  sx={{
                    borderRadius: "8px",
                    mb: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                >
                  <ListItemIcon>
                    <ExploreIcon sx={{ color: "#164863" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Explore"
                    primaryTypographyProps={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 500,
                    }}
                  />
                </ListItem>

                {!userData ? (
                  <>
                    <ListItem
                      component={Link}
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      sx={{
                        borderRadius: "8px",
                        mb: 1,
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      <ListItemIcon>
                        <LoginIcon sx={{ color: "#164863" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Sign in"
                        primaryTypographyProps={{
                          fontFamily: "Montserrat, sans-serif",
                          fontWeight: 500,
                        }}
                      />
                    </ListItem>
                    <ListItem
                      component={Link}
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      sx={{
                        borderRadius: "8px",
                        mb: 1,
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      <ListItemIcon>
                        <PersonAddIcon sx={{ color: "#164863" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Register"
                        primaryTypographyProps={{
                          fontFamily: "Montserrat, sans-serif",
                          fontWeight: 500,
                        }}
                      />
                    </ListItem>
                  </>
                ) : (
                  <>
                    {isApprovedServiceProvider && (
                      <ListItem
                        component={Link}
                        to="/myGigs"
                        onClick={() => setMobileMenuOpen(false)}
                        sx={{
                          borderRadius: "8px",
                          mb: 1,
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      >
                        <ListItemIcon>
                          <WorkIcon sx={{ color: "#164863" }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="My Services"
                          primaryTypographyProps={{
                            fontFamily: "Montserrat, sans-serif",
                            fontWeight: 500,
                          }}
                        />
                      </ListItem>
                    )}
                    <ListItem
                      component={Link}
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      sx={{
                        borderRadius: "8px",
                        mb: 1,
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      <ListItemIcon>
                        <PersonIcon sx={{ color: "#164863" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Profile"
                        primaryTypographyProps={{
                          fontFamily: "Montserrat, sans-serif",
                          fontWeight: 500,
                        }}
                      />
                    </ListItem>
                    <ListItem
                      component={Link}
                      to="/wishlist"
                      onClick={() => setMobileMenuOpen(false)}
                      sx={{
                        borderRadius: "8px",
                        mb: 1,
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      <ListItemIcon>
                        <FavoriteIcon sx={{ color: "#164863" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Wishlist"
                        primaryTypographyProps={{
                          fontFamily: "Montserrat, sans-serif",
                          fontWeight: 500,
                        }}
                      />
                    </ListItem>
                    <ListItem
                      component={Link}
                      to="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      sx={{
                        borderRadius: "8px",
                        mb: 1,
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      <ListItemIcon>
                        <ShoppingBagIcon sx={{ color: "#164863" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Bookings"
                        primaryTypographyProps={{
                          fontFamily: "Montserrat, sans-serif",
                          fontWeight: 500,
                        }}
                      />
                    </ListItem>

                    <Divider sx={{ my: 2 }} />

                    <ListItem
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      sx={{
                        borderRadius: "8px",
                        color: "#f44336",
                        "&:hover": {
                          backgroundColor: "rgba(244, 67, 54, 0.08)",
                        },
                      }}
                    >
                      <ListItemIcon>
                        <LogoutIcon sx={{ color: "#f44336" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Logout"
                        primaryTypographyProps={{
                          fontFamily: "Montserrat, sans-serif",
                          fontWeight: 500,
                          color: "#f44336",
                        }}
                      />
                    </ListItem>
                  </>
                )}
              </List>
            </>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;