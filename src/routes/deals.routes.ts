import { Router } from "express";
import { createDealController, deleteDealController, getDealController, updateDealController } from "../controllers/deals.controller.js";

const router = Router();

// POST /api/v1/deals
router.post("/", createDealController);

// GET /api/v1/deals - NOTE: This would only allow getting a specific deal by ID, other GET functions need to be created as well for things like filtered deal searches.
router.get("/", getDealController);

// PUT /api/v1/deals
router.put("/", updateDealController);

// DELETE /api/v1/deals
router.delete("/", deleteDealController);

export default router;
