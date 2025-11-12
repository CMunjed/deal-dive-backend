import { Request, Response } from "express";
import {
  saveDeal,
  getSavedDeals,
  unsaveDeal,
} from "../services/saved-deals.service.js";

// POST /api/v1/deals/:id/save
export async function saveDealController(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const dealId = req.params.id;
  try {
    const saved = await saveDeal(userId, dealId);
    return res.status(201).json(saved);
  } catch (error: unknown) {
    if (error instanceof Error && (error.message.includes("duplicate") || error.message.includes("unique"))) {
      return res.status(409).json({ error: "Deal already saved" });
    }
    return res.status(500).json({ error: "Internal server error" }); 
    // TODO: Give all 500 errors a consistent message - Also consider just returning error.message.
  }
}

// GET /api/v1/deals/saved
export async function getSavedDealsController(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const deals = await getSavedDeals(userId);
    return res.status(200).json(deals);
  } catch /*(error: unknown)*/ {
    return res.status(500).json({ error: "Internal server error" }); // TODO: See above TODO
  }
}

// DELETE /api/v1/deals/:id/save
export async function unsaveDealController(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const dealId = req.params.id;
  // Alternative: Send 'No content' response to indicate successful deletion
  // (Note: this response differs from deal deletion - choose one approach later)
  // await unsaveDeal(userId, dealId);
  // res.status(204).send();
  try {
    const deleted = await unsaveDeal(userId, dealId);
    if (!deleted) {
      return res.status(404).json({error: "Saved deal not found" });
    }
    // return res.status(200).json(deleted);
    return res.status(204).send();
  } catch /*(error: unknown)*/ {
    return res.status(500).json({ error: "Internal server error" }); // Placeholder error
  }
}
