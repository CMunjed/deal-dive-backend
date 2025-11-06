import { Request, Response } from "express";
import {
  saveDeal,
  // getSavedDeals,
  unsaveDeal
} from "../services/saved-deals.service.js";
    
// POST /api/v1/deals/:id/save
export async function saveDealController(req: Request, res: Response) {
  //try {
    // const userId = req.user.id; // get user.id from auth middleware
    //const { dealId } = req.params;
    //const saved = await saveDeal(userId, dealId);
    //return res.status(201).json(saved);
  //} catch (error: unknown) {
  //  return handleError(res, error);
  //}
}

// GET /saved
// export async function getSavedDealsController(req: Request, res: Response) {
  //try {
  //  const userId = req.user.id;
  //  const deals = await getSavedDeals(userId);
  //  return res.status(200).json(deals);
  //} catch (error: unknown) {
  //  return handleError(res, error);
  //}
// }

// DELETE /api/v1/deals/:id/save
export async function unsaveDealController(req: Request, res: Response) {
  //try {
  //  const userId = req.user.id;
  //  const { dealId } = req.params;
  //  await unsaveDeal(userId, dealId);
  //  return res.status(204).send();
  //} catch (error: unknown) {
  //  return handleError(res, error);
  //}
}
