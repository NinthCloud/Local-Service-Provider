// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import {
//   Container,
//   TextField,
//   Button,
//   Typography,
//   Card,
//   CardContent,
//   Alert,
//   Box,
//   InputAdornment,
//   IconButton,
//   useTheme,
//   useMediaQuery,
//   Divider,
//   Paper,
// } from "@mui/material";
// import {
//   Person,
//   Lock,
//   Visibility,
//   VisibilityOff,
//   Login as LoginIcon,
// } from "@mui/icons-material";
// import newRequest from "../../utils/newRequest";

// const Login = () => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState(null);
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);

//     try {
//       const res = await newRequest.post("/auth/login", { username, password });
//       localStorage.setItem("currentUser", JSON.stringify(res.data));
//       navigate("/");
//     } catch (err) {
//       setError(err.response?.data || "Something went wrong. Please try again.");
//     }
//   };

//   const handleClickShowPassword = () => {
//     setShowPassword(!showPassword);
//   };

//   return (
//     <Box
//       sx={{
//         backgroundImage: "url('/img/auto.jpg')", // Change to your image path
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         position: "relative",
//         overflow: "hidden",
//         "&::before": {
//           content: '""',
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           backdropFilter: "blur(8px)",
//           backgroundColor: "rgba(0, 0, 0, 0.4)",
//         },
//       }}
//     >
//       <Container
//         maxWidth="xs"
//         sx={{
//           position: "relative",
//           zIndex: 2,
//           px: { xs: 2, sm: 3 },
//         }}
//       >
//         <Paper
//           elevation={24}
//           sx={{
//             borderRadius: 4,
//             overflow: "hidden",
//             boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
//           }}
//         >
//           <Box
//             sx={{
//               height: "8px",
//               background: "linear-gradient(90deg, #1dbf73, #2196f3)",
//             }}
//           />

//           <Card
//             sx={{
//               width: "100%",
//               p: { xs: 2, sm: 3 },
//               borderRadius: 4,
//               background: "rgba(255, 255, 255, 0.95)",
//               backdropFilter: "blur(20px)",
//             }}
//           >
//             <CardContent>
//               <Box
//                 sx={{
//                   display: "flex",
//                   flexDirection: "column",
//                   alignItems: "center",
//                   mb: 3,
//                 }}
//               >
//                 <Typography
//                   variant={isMobile ? "h5" : "h4"}
//                   fontWeight="700"
//                   textAlign="center"
//                   sx={{
//                     background: "linear-gradient(90deg, #1dbf73, #2196f3)",
//                     backgroundClip: "text",
//                     color: "transparent",
//                     letterSpacing: "0.5px",
//                   }}
//                 >
//                   Welcome Back
//                 </Typography>
//                 <Typography
//                   variant="body2"
//                   color="text.secondary"
//                   textAlign="center"
//                   mt={1}
//                 >
//                   Enter your credentials to access your account
//                 </Typography>
//               </Box>

//               {error && (
//                 <Alert
//                   severity="error"
//                   sx={{
//                     mb: 3,
//                     borderRadius: 2,
//                     '& .MuiAlert-icon': {
//                       alignItems: 'center',
//                     },
//                   }}
//                   variant="filled"
//                 >
//                   {error}
//                 </Alert>
//               )}

//               <Box
//                 component="form"
//                 onSubmit={handleSubmit}
//                 sx={{
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: 3,
//                 }}
//               >
//                 <TextField
//                   label="Username"
//                   variant="outlined"
//                   fullWidth
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   required
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <Person color="primary" />
//                       </InputAdornment>
//                     ),
//                   }}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 2,
//                     },
//                   }}
//                 />

//                 <TextField
//                   label="Password"
//                   type={showPassword ? 'text' : 'password'}
//                   variant="outlined"
//                   fullWidth
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <Lock color="primary" />
//                       </InputAdornment>
//                     ),
//                     endAdornment: (
//                       <InputAdornment position="end">
//                         <IconButton
//                           aria-label="toggle password visibility"
//                           onClick={handleClickShowPassword}
//                           edge="end"
//                         >
//                           {showPassword ? <VisibilityOff /> : <Visibility />}
//                         </IconButton>
//                       </InputAdornment>
//                     ),
//                   }}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 2,
//                     },
//                   }}
//                 />

//                 <Button
//                   type="submit"
//                   variant="contained"
//                   fullWidth
//                   size="large"
//                   startIcon={<LoginIcon />}
//                   sx={{
//                     mt: 1,
//                     py: 1.5,
//                     borderRadius: 2,
//                     textTransform: 'none',
//                     fontWeight: 600,
//                     fontSize: '1rem',
//                     background: 'linear-gradient(90deg, #1dbf73, #2196f3)',
//                     boxShadow: '0 4px 15px rgba(29, 191, 115, 0.3)',
//                     transition: 'all 0.3s ease',
//                     '&:hover': {
//                       boxShadow: '0 6px 20px rgba(29, 191, 115, 0.4)',
//                       transform: 'translateY(-2px)',
//                     },
//                   }}
//                 >
//                   Sign In
//                 </Button>
//               </Box>

//               <Box sx={{ mt: 4, mb: 2 }}>
//                 <Divider>
//                   <Typography
//                     variant="body2"
//                     color="text.secondary"
//                     sx={{ px: 1 }}
//                   >
//                     OR
//                   </Typography>
//                 </Divider>
//               </Box>

//               <Typography
//                 variant="body2"
//                 textAlign="center"
//                 sx={{
//                   display: 'flex',
//                   justifyContent: 'center',
//                   alignItems: 'center',
//                   gap: 0.5,
//                 }}
//               >
//                 Don't have an account?{" "}
//                 <Link
//                   to="/register"
//                   style={{
//                     color: "#1dbf73",
//                     textDecoration: "none",
//                     fontWeight: 600,
//                   }}
//                 >
//                   Register here
//                 </Link>
//               </Typography>
//             </CardContent>
//           </Card>
//         </Paper>
//       </Container>
//     </Box>
//   );
// };

// export default Login;

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  Box,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
  Paper,
} from "@mui/material";
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from "@mui/icons-material";
import newRequest from "../../utils/newRequest";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await newRequest.post("/auth/login", { username, password });
      localStorage.setItem("currentUser", JSON.stringify(res.data));
      navigate("/");
      window.location.reload();
    } catch (err) {
      setError(err.response?.data || "Something went wrong. Please try again.");
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        backgroundImage: "url('/img/auto.jpg')", // Change to your image path
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        },
      }}
    >
      <Container
        maxWidth="xs"
        sx={{
          position: "relative",
          zIndex: 2,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Paper
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Box
            sx={{
              height: "8px",
              background: "linear-gradient(90deg, #1dbf73, #2196f3)",
            }}
          />

          <Card
            sx={{
              width: "100%",
              p: { xs: 2, sm: 3 },
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  fontWeight="700"
                  textAlign="center"
                  sx={{
                    background: "linear-gradient(90deg, #1dbf73, #2196f3)",
                    backgroundClip: "text",
                    color: "transparent",
                    letterSpacing: "0.5px",
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  mt={1}
                >
                  Enter your credentials to access your account
                </Typography>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      alignItems: 'center',
                    },
                  }}
                  variant="filled"
                >
                  {error}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                <TextField
                  label="Username"
                  variant="outlined"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<LoginIcon />}
                  sx={{
                    mt: 1,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    background: 'linear-gradient(90deg, #1dbf73, #2196f3)',
                    boxShadow: '0 4px 15px rgba(29, 191, 115, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(29, 191, 115, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Sign In
                </Button>
              </Box>

              <Box sx={{ mt: 4, mb: 2 }}>
                <Divider>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ px: 1 }}
                  >
                    OR
                  </Typography>
                </Divider>
              </Box>

              <Typography
                variant="body2"
                textAlign="center"
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                Don't have an account?{" "}
                <Link
                  to="/register"
                  style={{
                    color: "#1dbf73",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Register here
                </Link>

                
              </Typography>
              
              <Typography
                variant="body2"
                textAlign="center"
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                Forget account password?{" "}
                <Link
                  to="/passwordreset"
                  style={{
                    color: "#1dbf73",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Reset Password
                </Link>

                
              </Typography>
            </CardContent>
          </Card>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;