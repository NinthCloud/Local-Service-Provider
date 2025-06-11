import express from "express";
import { 
  deleteUser, 
  getUser, 
  updateUser, 
  getAllProviders, 
  getProvider, 
  updatePassword,
  getProviderForUser,
  getProviderUser
} from "../controllers/user.controllerr.js";
import { verifyToken } from "../middleware/jwtt.js";

export const router = express.Router();

// User routes
router.delete("/:id", verifyToken, deleteUser);
router.get("/:id", getUser);
// single provider details   to be kept at last
router.get("/user/:id", verifyToken, getProviderUser);
router.get("/providerid/:id", getProviderForUser);
router.put("/:id", verifyToken, updateUser);
router.put("/:id/change-password", verifyToken, updatePassword);

// Provider-related routes integrated within user routes
router.get("/provider/all", getAllProviders); // get provider details
router.get("/provider/:id", getProvider);

export default router;
