import { Request, Response } from "express";
import {
  createDeal,
  deleteDeal,
  getDeal,
  getDeals,
  updateDeal,
} from "../services/deals.service.js";

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
  try {
    const userId = req.body.userId; // TODO: Get this from auth middleware instead of the request body
    const dealData = req.body;
    const deal = await createDeal(userId, dealData);
    return res.status(201).json(deal);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}

export async function getDealController(req: Request, res: Response) {
  try {
    const dealId = req.params.id;
    const deal = await getDeal(dealId);
    return res.status(200).json(deal);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}

export async function getDealsController(req: Request, res: Response) {
  try {
    const { createdBy, tags, categories, longitude, latitude, radius } = req.query;

    // Validate location parameters
    const hasGeoParams = longitude && latitude && radius;
    const missingGeoParams =
      (longitude || latitude || radius) && !(longitude && latitude && radius);

    if (missingGeoParams) {
      return res.status(400).json({
        error: "When providing location filters, longitude, latitude, and radius must all be specified.",
      });
    }

    // Parse tags and categories
    const parsedTags =
      typeof tags === "string"
        ? tags.split(",").map((t) => t.trim()).filter(Boolean)
        : Array.isArray(tags) // If tags is an array, i.e. if request looks like: /api/v1/deals?tags=tag1&tags=tag2
        ? (tags.map(String) as string[]) // THEN just use the array
        : undefined; // Else, set to undefined

    const parsedCategories =
      typeof categories === "string"
        ? categories.split(",").map((c) => c.trim()).filter(Boolean)
        : Array.isArray(categories)
        ? (categories.map(String) as string[])
        : undefined;

    // Normalize location parameters
    const geoFilter = hasGeoParams
      ? {
          longitude: parseFloat(longitude as string),
          latitude: parseFloat(latitude as string),
          radius: parseFloat(radius as string),
        }
      : undefined;

    // Pass parameters to service layer
    const deals = await getDeals({
      createdBy: createdBy as string | undefined,
      tags: parsedTags,
      categories: parsedCategories,
      geo: geoFilter,
    });

    return res.status(200).json(deals);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}

export async function updateDealController(req: Request, res: Response) {
  try {
    const dealId = req.params.id;
    const updates = req.body;
    const updatedDeal = await updateDeal(dealId, updates);
    return res.status(200).json(updatedDeal);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}

export async function deleteDealController(req: Request, res: Response) {
  try {
    const dealId = req.params.id;
    const deletedDeal = await deleteDeal(dealId);
    return res.status(200).json(deletedDeal);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}
