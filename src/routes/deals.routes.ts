import { Router } from "express";
import { createDealController } from "../controllers/deals.controller.js";

const router = Router();

// POST /api/v1/deals
router.post("/", createDealController);

export default router;
