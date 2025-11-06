import { Router } from "express";
import {
  createDealController,
  deleteDealController,
  getDealController,
  getDealsController,
  updateDealController,
} from "../controllers/deals.controller.js";
import { authMiddleware } from "../middleware/auth-middleware.js";

const router = Router();

// POST /api/v1/deals
router.post("/", authMiddleware, createDealController);

// GET /api/v1/deals/:id - Get one deal's data by ID
router.get("/:id", getDealController);

// GET /api/v1/deals - Get multiple deals, specify criteria using query parameters
router.get("/", getDealsController);

// PUT /api/v1/deals
router.put("/:id", updateDealController);

// DELETE /api/v1/deals
router.delete("/:id", deleteDealController);

export default router;
