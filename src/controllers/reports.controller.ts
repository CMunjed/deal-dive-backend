import { Request, Response } from "express";
import {
  addReport,
  getReportsByDeal,
  deleteReport,
} from "../services/reports.service.js";

// POST /api/v1/deals/:id/reports
export async function addReportController(req: Request, res: Response) {
  try {
    const { id: dealId } = req.params;
    const { userId, reason } = req.body;

    if (!userId || !reason) {
      return res.status(400).json({ error: "userId and reason are required" });
    }

    const report = await addReport(userId, dealId, reason);
    res.json(report);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(400).json({ error: "Unknown error" });
    }
  }
}

// GET /api/v1/deals/:id/reports
export async function getReportsController(req: Request, res: Response) {
  try {
    const { id: dealId } = req.params;
    const reportResult = await getReportsByDeal(dealId);

    res.json({
      count: reportResult.totalCount,
      reports: reportResult.reports,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(400).json({ error: "Unknown error" });
    }
  }
}

// DELETE /api/v1/reports/:id
export async function deleteReportController(req: Request, res: Response) {
  try {
    const { id: reportId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    await deleteReport(reportId, userId);
    res.json({ message: "Report deleted successfully" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(400).json({ error: "Unknown error" });
    }
  }
}
