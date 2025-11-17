import { Request, Response } from "express";
import { getAllCategories } from "../services/categories.service.js";

export async function getAllCategoriesController(_req: Request, res: Response) {
  try {
    const categories = await getAllCategories();
    res.status(200).json(categories);
  } catch {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
}
