import { Router } from "express";
import {
  getNearbyDeals,
  createDeal,
  getDealById,
  updateDeal,
  deleteDeal,
} from "../controllers/deals.controller.js";
// import { authenticateUser } from "../middleware/auth.js";

const router = Router();

// GET /api/v1/deals/nearby
router.get("/nearby", getNearbyDeals);

// POST /api/v1/deals
// router.post("/", authenticateUser, createDeal);
router.post("/", createDeal);

// GET /api/v1/deals/:id
router.get("/:id", getDealById);

// PUT /api/v1/deals/:id
// router.put("/:id", authenticateUser, updateDeal);
router.put("/:id", updateDeal);

// DELETE /api/v1/deals/:id
// router.delete("/:id", authenticateUser, deleteDeal);
router.delete("/:id", deleteDeal);

export default router;
