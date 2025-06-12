import React from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  CssBaseline,
  Container,
  ThemeProvider,
  createTheme,
} from "@mui/material";

import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Home from "./pages/home/Home";
import Gigs from "./pages/gigs/Gigs";
import Gig from "./pages/gig/Gig";
import Add from "./pages/add/Add";
import Orders from "./pages/orders/Orders";
import Order from "./pages/order/Order";
import MyGigs from "./pages/myGigs/MyGigs";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import BookingPage from "./pages/bookingPage/BookingPage";
import EditGig from "./pages/editGig/EditGig";
import Profile from "./pages/profile/Profile";
import Wishlist from "./pages/wishlist/Wishlist";
import EditProfile from "./pages/viewProfile/EditProfile";
import ChangePassword from "./pages/changePassword/ChangePassword";
import PasswordReset from "./pages/passwordreset/PasswordReset";
import Pay from "./pages/pay/Pay";
import Success from "./pages/success/Success";
import "./app.scss";

import AdminDashboard from "./admin/AdminDashboard";
import DashboardHome from "./admin/pages/DashboardHome";
import UserManagement from "./admin/pages/UserManagement";
import ProviderApprovals from "./admin/pages/ProviderApproval";
import Bookings from "./admin/pages/Bookings";
import Applications from "./admin/pages/Reports";
import Reviews from "./admin/pages/Reviews";
import Settings from "./admin/pages/Settings";
import ProviderDetails from "./admin/pages/ProviderDetails";
import ServiceDetails from "./admin/pages/ServiceDetails";
import BookingDetails from "./admin/pages/BookingDetails";
import HandleCat from "./admin/pages/HandleCat";
import AllCat from "./pages/gigs/AllCat";
import Dashboard from "./admin/pages/Dasboard";

// Custom Theme with Montserrat Font
const theme = createTheme({
  typography: {
    fontFamily: "Montserrat, sans-serif",
  },
});

const queryClient = new QueryClient();

const Layout = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <Navbar />
        {/* <Featured/> */}
        <Container
          maxWidth={false} // Disables default maxWidth restrictions
          sx={{
            maxWidth: "1500px", // Custom width of 1400px
            minHeight: "calc(100vh - 160px)",
            paddingY: { xs: 2, md: 4 },
          }}
        >
          <Outlet />
        </Container>

        <Footer />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
};

// React Router Setup
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/gigs", element: <Gigs /> },
      { path: "/categories", element: <AllCat /> },
      { path: "/gig/:id", element: <Gig /> },
      { path: "/orders", element: <Orders /> },
      { path: "/booking/:id", element: <Order /> },
      { path: "/myGigs", element: <MyGigs /> },
      { path: "/add", element: <Add /> },
      { path: "/register", element: <Register /> },
      { path: "/login", element: <Login /> },
      { path: "/confirmbooking/:id", element: <BookingPage /> },
      { path: "/editGig/:id", element: <EditGig /> },
      { path: "/wishlist", element: <Wishlist /> },
      { path: "/profile", element: <Profile /> },
      { path: "/editprofile", element: <EditProfile /> },
      { path: "/changepassword", element: <ChangePassword /> },
      { path: "/passwordreset", element: <PasswordReset /> },
      {
        path: "/pay/:bookingId",
        element: <Pay />,
      },
      {
        path: "/success",
        element: <Success />,
      },
    ],
  },

  {
    path: "/admin",
    element: <AdminDashboard />,
    children: [
      { path: "", element: <DashboardHome /> }, // Default admin page
      { path: "users", element: <UserManagement /> },
      { path: "providers", element: <ProviderApprovals /> },
      { path: "bookings", element: <Bookings /> },
      { path: "applications", element: <Applications /> },
      { path: "reviews", element: <Reviews /> },
      { path: "settings", element: <Settings /> },
      { path: "providerdetails/:userId", element: <ProviderDetails /> },
      { path: "servicedetails/:id", element: <ServiceDetails /> },
      { path: "orderdetails/:bookingId", element: <BookingDetails /> },
      { path: "handlecategory", element: <HandleCat /> },
      { path: "dashboard", element: <Dashboard /> },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
