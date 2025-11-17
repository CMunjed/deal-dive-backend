import { Request, Response } from "express";
import {
  saveDeal,
  getSavedDeals,
  unsaveDeal,
} from "../services/saved-deals.service.js";
import { requireUserId } from "../middleware/auth-middleware.js";

// POST /api/v1/deals/:id/save
export async function saveDealController(req: Request, res: Response) {
  const userId = requireUserId(req);
  const dealId = req.params.id;
  try {
    const saved = await saveDeal(userId, dealId);
    return res.status(201).json(saved);
  } catch /*(error: unknown)*/ {
    /*if (error instanceof Error && (error.message.includes("duplicate") || error.message.includes("unique"))) {
      return res.status(409).json({ error: "Deal already saved" });
    }
    return res.status(500).json({ error: "Internal server error" }); */
    // TODO: More standardized error handling
    return res.status(500).json({ error: "Error saving deal" });
  }
}

// GET /api/v1/deals/saved
export async function getSavedDealsController(req: Request, res: Response) {
  const userId = requireUserId(req);
  try {
    const deals = await getSavedDeals(userId);
    return res.status(200).json(deals);
  } catch /*(error: unknown)*/ {
    return res.status(500).json({ error: "Error fetching saved deals" }); // TODO: See above TODO
  }
}

// DELETE /api/v1/deals/:id/save
export async function unsaveDealController(req: Request, res: Response) {
  const userId = requireUserId(req);
  const dealId = req.params.id;
  // 204: Send 'No content' response to indicate successful deletion
  // This response differs from deal deletion - choose one approach later)
  // Alternatively, 200: include deleted savedDeal content
  try {
    const deleted = await unsaveDeal(userId, dealId);
    if (!deleted) {
      return res.status(404).json({ error: "Saved deal not found" });
    }
    // return res.status(200).json(deleted);
    return res.status(204).send();
  } catch /*(error: unknown)*/ {
    return res.status(500).json({ error: "Error unsaving deal" }); // TODO: See above TODO
  }
}
