import { Request, Response } from "express";
import { supabase } from "../config/supabase-client.js";

/**
 * GET /api/deals/nearby
 */
export const getNearbyDeals = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "latitude and longitude are required" });
    }

    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);
    const radiusMeters = parseInt(radius as string, 10);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ error: "Invalid latitude or longitude values" });
    }

    if (isNaN(radiusMeters) || radiusMeters <= 0) {
      return res.status(400).json({ error: "Invalid radius value" });
    }

    const { data, error } = await supabase.rpc("get_nearby_deals", {
      user_lat: lat,
      user_lon: lon,
      distance_m: radiusMeters,
    });

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      meta: { latitude: lat, longitude: lon, radius: radiusMeters, count: data?.length || 0 },
    });
  } catch (error) {
    console.error("Error fetching nearby deals:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch nearby deals",
    });
  }
};

/**
 * POST /api/deals
 */
export const createDeal = async (req: Request, res: Response) => {
  try {
    const userId = "00000000-0000-0000-0000-000000000000"; // temporary

    const {
      title,
      description,
      address,
      latitude,
      longitude,
      original_price,
      discounted_price,
    } = req.body;

    if (!title || !address || latitude === undefined || longitude === undefined || !discounted_price) {
      return res.status(400).json({
        error: "title, address, latitude, longitude, and discounted_price are required",
      });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: "Invalid latitude or longitude values" });
    }

    const { data, error } = await supabase
      .from("deals")
      .insert({
        title,
        description,
        address,
        geom: `POINT(${longitude} ${latitude})`,
        original_price,
        discounted_price,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error("Error creating deal:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create deal",
    });
  }
};

/**
 * GET /api/deals/:id
 */
export const getDealById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase.from("deals").select("*").eq("id", id).single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Deal not found" });
      }
      throw error;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching deal:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch deal",
    });
  }
};

/**
 * PUT /api/deals/:id
 */
export const updateDeal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body };

    if (updateData.latitude !== undefined && updateData.longitude !== undefined) {
      const lat = updateData.latitude;
      const lon = updateData.longitude;
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return res.status(400).json({ error: "Invalid latitude or longitude values" });
      }
      updateData.geom = `POINT(${lon} ${lat})`;
      delete updateData.latitude;
      delete updateData.longitude;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("deals")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Deal not found" });
      }
      throw error;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error updating deal:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to update deal",
    });
  }
};

/**
 * DELETE /api/deals/:id
 */
export const deleteDeal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("deals").delete().eq("id", id);

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Deal not found" });
      }
      throw error;
    }

    res.json({ success: true, message: "Deal deleted successfully" });
  } catch (error) {
    console.error("Error deleting deal:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to delete deal",
    });
  }
};
