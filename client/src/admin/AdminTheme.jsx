import { createTheme } from "@mui/material/styles";

const AdminTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0A0A0F",
      paper: "#141420",
    },
    primary: {
      main: "#2D7FF9",
    },
    secondary: {
      main: "#18D7C7",
    },
    text: {
      primary: "#ffffff",
      secondary: "#94A3B8",
    },
    action: {
      hover: "rgba(45, 127, 249, 0.08)",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Montserrat', sans-serif",
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
          textTransform: "none",
          padding: "8px 16px",
          fontWeight: 600,
        },
        contained: {
          "&:hover": {
            boxShadow: "0 6px 12px rgba(45, 127, 249, 0.2)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.2)",
          overflow: "hidden",
          background: "linear-gradient(145deg, rgba(40, 44, 68, 0.8), rgba(30, 34, 58, 0.8))",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 0,
          backdropFilter: "blur(10px)",
          backgroundImage: "linear-gradient(180deg, #141425 0%, #0D0D15 100%)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: "4px 0",
          "&.Mui-selected": {
            backgroundColor: "rgba(45, 127, 249, 0.08)",
            "&:hover": {
              backgroundColor: "rgba(45, 127, 249, 0.12)",
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
          },
        },
      },
    },
  },
});

export default AdminTheme;