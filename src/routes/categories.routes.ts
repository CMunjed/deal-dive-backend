import { Router } from "express";
import { getAllCategoriesController } from "../controllers/categories.controller.js";

const router = Router();

// GET /api/v1/categories
router.get("/", getAllCategoriesController);

export default router;
