import { Router } from "express";
import { addReportController, getReportsController, deleteReportController } from "../controllers/reports.controller.js";

const router = Router();

// POST /api/v1/deals/:id/reports
router.post("/deals/:id/reports", addReportController);

// GET /api/v1/deals/:id/reports
router.get("/deals/:id/reports", getReportsController);

// DELETE /api/v1/reports/:id
router.delete("/reports/:id", deleteReportController);

export default router;
