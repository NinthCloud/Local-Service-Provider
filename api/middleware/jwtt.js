import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";
import {User,} from "../models/index.js"// Import User model

export const verifyToken = async (req, res, next) => {
  try {
    let token = req.cookies.accessToken;

    // Check if token is in Authorization header
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1]; // Extract Bearer token
    }

    if (!token) {
     // console.log("No token provided");
      return next(createError(401, "You are not logged in"));
    }

    //console.log("Received Token:", token);

    const payload = jwt.verify(token, process.env.JWT_KEY);
   // console.log("Decoded Token Payload:", payload);

    // Fetch user from PostgreSQL using Sequelize
    const user = await User.findByPk(payload.id); // Use `id` instead of `_id`
    
    if (!user) {
     // console.log("User not found in DB");
      return next(createError(404, "User not found"));
    }

   // console.log("User Found:", user.toJSON());

    req.userId = user.id;
    req.isSeller = user.isSeller || false; 
    req.appliedForProvider = user.appliedForProvider || false;
    req.approvedByAdmin = user.approvedByAdmin || false;
    req.providerId = user.providerId || null;
    req.role = user.role || "user"; 

    next();
  } catch (err) {
    //console.log("JWT Verification Error:", err.message);
    return next(createError(403, "Token is not valid"));
  }
};
