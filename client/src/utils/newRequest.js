// import axios from "axios";
// import getCurrentUser from "./getCurrentUser";

// const newRequest = axios.create({
//   baseURL: "http://localhost:5000/api/",
//   withCredentials: true,  // Allow cross-origin requests with credentials
// });


// newRequest.interceptors.response.use(
//   response => response, 
//   (error) => {
//     // If the error is due to authentication, just ignore it for unauthenticated requests
//     if (error.response && error.response.status === 401) {
//       return Promise.resolve(error.response);
//     }
//     return Promise.reject(error);
//   }
// );

// export default newRequest;


import axios from "axios";

const newRequest = axios.create({
  baseURL: import.meta.env.CLIENT_URL || "/api",
  withCredentials: true,  // Allow cross-origin requests with credentials
});

newRequest.interceptors.response.use(
  response => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      return Promise.resolve(error.response);
    }
    return Promise.reject(error);
  }
);

export default newRequest;
