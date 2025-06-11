// In your review routes file
import express from "express";
import { verifyToken } from "../middleware/jwtt.js";
import {
  createReview,
  getReviews,
  deleteReview,
  getReviewableBookings
} from "../controllers/review.controllerr.js";

const router = express.Router();

router.post("/", verifyToken, createReview);
router.get("/:serviceId", getReviews);
router.delete("/:id", verifyToken, deleteReview); // Added verifyToken here for security
router.get("/:serviceId/reviewable", verifyToken, getReviewableBookings);

export default router;