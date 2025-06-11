import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  checkWishlistStatus
} from "../controllers/wishlist.controller.js";
import { verifyToken } from "../middleware/jwtt.js";

const router = express.Router();

// All wishlist routes are protected
router.put("/:id", verifyToken, addToWishlist);
router.get("/", verifyToken, getWishlist);
router.delete("/:id", verifyToken, removeFromWishlist);
router.get("/check/:id", verifyToken, checkWishlistStatus);

export default router;