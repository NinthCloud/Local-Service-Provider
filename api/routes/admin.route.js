import express from "express";
import {
  getPendingProviders,
  approveProvider,
  rejectProvider,
  getProviders,
  getProvider,
  getUsers,
  revokeProvider,
  getRegularUsers,
  getOrders,
  getReviews,
  deleteUser,
  getGigs,
  deleteGig,
  deleteReview,
  getOrder,
  getGig,
  getUser,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from "../controllers/admin.controllerr.js";
import { verifyToken } from "../middleware/jwtt.js";
import { verifyAdmin } from "../middleware/adminn.js";

// import { router } from "./user.route.js";

const router = express.Router();

// Public route to get all active categories
router.get("/categories", getAllCategories);

// Admin routes for category management
router.post("/categories", verifyToken, verifyAdmin, createCategory);

// Get users who applied to become providers
router.get("/pending-providers", verifyToken, verifyAdmin, getPendingProviders);

// Approve provider application
router.post("/approve/:userId", verifyToken, verifyAdmin, approveProvider);

// Reject provider application
router.post("/reject/:userId", verifyToken, verifyAdmin, rejectProvider);

// Reject provider application
router.post("/revoke/:userId", verifyToken, verifyAdmin, revokeProvider);

// Get users who are providers
router.get("/providers", verifyToken, verifyAdmin, getProviders);

// get all users
router.get("/users", verifyToken, verifyAdmin, getUsers);

// route for regular users
router.get("/regular-users", verifyToken, verifyAdmin, getRegularUsers);

// get all orders
router.get("/orders", verifyToken, verifyAdmin, getOrders);

// get order details
router.get("/booking/:bookingId", verifyToken, verifyAdmin, getOrder);

// get reviews
router.get("/reviews", verifyToken, verifyAdmin, getReviews);

// delete review
router.delete("/deletereview/:reviewId", verifyToken, verifyAdmin, deleteReview);

//get services
router.get("/services", getGigs);

// get service details
router.get("/service/:id", getGig);

// delete services
router.patch("/delete/:id", verifyToken, verifyAdmin, deleteGig);

//get single user details
router.get("/user/:id", verifyToken, verifyAdmin, getUser);

// delete user
router.delete("/userDelete/:id", verifyToken, deleteUser);

// single provider details   to be kept at last
router.get("/:id", verifyToken, verifyAdmin, getProvider);

// handle category
router.put("/categories/:id", verifyToken, verifyAdmin, updateCategory);
router.delete("/categories/:id", verifyToken, verifyAdmin, deleteCategory);

export default router;
