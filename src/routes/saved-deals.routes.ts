import { Router } from "express";
import {
  saveDealController,
  // getSavedDealsController,
  unsaveDealController
} from "../controllers/saved-deals.controller.js";

const router = Router();

// POST /api/v1/deals/:id/save - Save a deal
router.post("/:id/save", saveDealController);

// GET /api/v1/saved - Get all a user's saved deals
// router.get("/", getSavedDealsController);

// DELETE /api/v1/deals/:id/save - Unsave a deal
router.delete("/:id/save", unsaveDealController);

export default router;
