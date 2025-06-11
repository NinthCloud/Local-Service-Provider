import express from "express";
import { getAllCategories, getAllCategoriesPaginated} from "../controllers/category.controller.js";
import { verifyToken } from "../middleware/jwtt.js";

const router = express.Router();
// Public route to get all active categories
router.get("/category", getAllCategories);
router.get("/categories", getAllCategoriesPaginated);

export default router;