import { Request, Response } from "express";
import {
  saveDeal,
  getSavedDeals,
  unsaveDeal
} from "../services/saved-deals.service.js";
    
// POST /api/v1/deals/:id/save
export async function saveDealController(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No user ID found" });
    }
    const dealId = req.params.id;
    const saved = await saveDeal(userId, dealId);
    return res.status(201).json(saved);
  } catch (error: unknown) {
    return res.status(500).json({ error: "Error placeholder" }); // Placeholder error
  }
}

// GET /api/v1/deals/saved
export async function getSavedDealsController(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No user ID found" });
    }
    const deals = await getSavedDeals(userId);
    return res.status(200).json(deals);
  } catch (error: unknown) {
    return res.status(500).json({ error: "Error placeholder" }); // Placeholder error
  }
}

// DELETE /api/v1/deals/:id/save
export async function unsaveDealController(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No user ID found" });
    }
    const dealId = req.params.id;
    // Alternative: Send 'No content' response to indicate successful deletion 
    // (Note: this response differs from deal deletion - choose one approach later)
    // await unsaveDeal(userId, dealId);
    // res.status(204).send(); 
    const deleted = await unsaveDeal(userId, dealId);
    return res.status(200).json(deleted);
  } catch (error: unknown) {
    return res.status(500).json({ error: "Error placeholder" }); // Placeholder error
  }
}
