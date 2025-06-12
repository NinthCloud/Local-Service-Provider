import express from "express";
import { verifyToken } from "../middleware/jwtt.js";
import { getOrders, createOrder, cancelOrder, confirmOrder, getOrder, checkReviewableStatus, intent, confirmBooking, } from "../controllers/booking.controllerr.js";


const router = express.Router();

router.post("/create-payment-intent/:bookingId", verifyToken, intent);
router.put("/confirm", verifyToken, confirmBooking);

// Create a new order
router.post("/:serviceId", verifyToken, (req, res, next) => {
  //console.log("Create order route hit with gigId:", req.params.serviceId);
  next();
}, createOrder);

// Get orders for the current user
router.get("/", verifyToken, (req, res, next) => {
  //console.log("Get orders route hit for user:", req.userId);
  next();
}, getOrders);

// Confirm an order (only seller can do this)
router.patch("/:bookingId/confirm", verifyToken, (req, res, next) => {
 // console.log("Confirm order route hit with orderId:", req.params.orderId);
  next();
}, confirmOrder);

// Cancel an order (buyer or seller can do this)
router.patch("/:bookingId/cancel", verifyToken, (req, res, next) => {
  next();
}, cancelOrder);

// view single order details both buyer and seller can view it
router.get("/:bookingId", verifyToken, (req, res, next) => {
  next();
}, getOrder)

// Check if the user has booked and confirmed a specific gig
// router.get("/:serviceId/status", verifyToken, checkOrderStatus);

router.get("/:serviceId/reviewable", verifyToken, checkReviewableStatus);

// Manually trigger order expiration (Admin only)
// router.post("/expire-orders", verifyToken, async (req, res) => {
//   try {
//     await expirePastOrders();
//     res.status(200).json({ message: "Expired past orders successfully." });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to expire past orders." });
//   }
// });  // to be added in the frontend 

export default router;
