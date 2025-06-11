import axios from "axios";
import getCurrentUser from "./getCurrentUser";

const newRequest = axios.create({
  baseURL: "http://localhost:5000/api/",
  withCredentials: true,  // Allow cross-origin requests with credentials
});

// Add an interceptor to handle token insertion if available
// newRequest.interceptors.request.use(
//   (config) => {
//     const currentUser = getCurrentUser(); // Retrieve current user from localStorage
//     if (currentUser?.token) {
//       // If the user is logged in and the token is available, add it to the headers
//       config.headers.Authorization = `Bearer ${currentUser.token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Allow unauthenticated requests to be made
newRequest.interceptors.response.use(
  response => response, 
  (error) => {
    // If the error is due to authentication, just ignore it for unauthenticated requests
    if (error.response && error.response.status === 401) {
      return Promise.resolve(error.response);
    }
    return Promise.reject(error);
  }
);

export default newRequest;
