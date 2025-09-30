import { Request, Response } from "express";
import { getDummyData } from "../services/dummy.service.js";

export async function getDummyHandler(_req: Request, res: Response) {
  try {
    const data = await getDummyData();
    res.json(data);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
}
