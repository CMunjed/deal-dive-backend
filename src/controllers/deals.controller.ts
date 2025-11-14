import { Request, Response } from "express";
import {
  createDeal,
  deleteDeal,
  getDeal,
  getDeals,
  updateDeal,
} from "../services/deals.service.js";
import { requireUserId } from "../middleware/auth-middleware.js";

// TODO: Consider moving this helper function somewhere else
const handleError = (res: Response, error: unknown) => {
  if (error instanceof Error) {
    if (error.message === "Deal not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message || "Unexpected error" });
  }

  return res.status(500).json({ error: "Unexpected error" });
};

export async function createDealController(req: Request, res: Response) {
  const userId = requireUserId(req);
  const dealData = req.body;
  try {
    const deal = await createDeal(userId, dealData);
    return res.status(201).json(deal);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}

export async function getDealController(req: Request, res: Response) {
  const dealId = req.params.id;
  try {
    const deal = await getDeal(dealId);
    return res.status(200).json(deal);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}

export async function getDealsController(req: Request, res: Response) {
  // TODO: Modify this to accept more query parameters as added
  const { userId } = req.query;
  try {
    const deals = await getDeals(userId as string | undefined);
    return res.status(200).json(deals);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}

export async function updateDealController(req: Request, res: Response) {
  const dealId = req.params.id;
  const updates = req.body;
  try {
    const updatedDeal = await updateDeal(dealId, updates);
    return res.status(200).json(updatedDeal);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}

export async function deleteDealController(req: Request, res: Response) {
  const dealId = req.params.id;
  try {
    const deletedDeal = await deleteDeal(dealId);
    return res.status(200).json(deletedDeal);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}
