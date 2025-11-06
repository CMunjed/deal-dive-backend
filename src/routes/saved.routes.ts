import { Router } from "express";
import {
  saveDealController,
  getSavedDealsController,
  unsaveDealController
} from "../controllers/saved.controller.js";

const router = Router();

// POST /api/v1/saved - Save a deal
router.post("/", saveDealController);

// GET /api/v1/saved - Get all a user's saved deals
router.get("/", getSavedDealsController);

// DELETE /api/v1/saved - Unsave a deal
router.delete("/:id", unsaveDealController);

export default router;
