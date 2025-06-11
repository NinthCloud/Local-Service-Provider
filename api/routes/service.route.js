import express from "express";
import {
  createGig,
  deleteGig,
  getGig,
  getGigs,
  editGig,
  toggleGigStatus,
  updateGigAvailability,
  getAvailability,
  updateSales,
} from "../controllers/service.controllerr.js";
import { verifyToken } from "../middleware/jwtt.js";
const router = express.Router();

//public routes..

router.get("/single/:id", getGig);
router.get("/", getGigs);

//protected routes
router.post("/", verifyToken, createGig);
router.patch("/:id", verifyToken, deleteGig);
router.put("/:id", verifyToken, editGig)

// New route for toggling gig status
router.patch("/:id/toggle-status", verifyToken, toggleGigStatus);
router.patch("/:id", verifyToken, updateSales);
// availability
router.patch("/:id/availability", verifyToken, updateGigAvailability);
router.get("/:id/availability", getAvailability); // <-- New route to get availability

export default router;
