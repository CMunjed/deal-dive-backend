import { Router, Request, Response } from "express";
// import { authenticateUser } from "../middleware/auth.js";
import { supabase } from "../config/supabase-client.js";

// Test the deals with npm run seed

const router = Router();

/**
 * GET /api/deals/nearby
 * Get deals within a radius of specified coordinates
 * Query params: latitude, longitude, radius (optional, default 5000m)
 */
router.get('/nearby', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query;

    // Validate required params
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'latitude and longitude are required' 
      });
    }

    // Parse and validate coordinates
    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);
    const radiusMeters = parseInt(radius as string, 10);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ 
        error: 'Invalid latitude or longitude values' 
      });
    }

    if (isNaN(radiusMeters) || radiusMeters <= 0) {
      return res.status(400).json({ 
        error: 'Invalid radius value' 
      });
    }

    // Call the PostgreSQL function
    const { data, error } = await supabase.rpc('get_nearby_deals', {
      user_lat: lat,
      user_lon: lon,
      distance_m: radiusMeters,
    });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    res.json({
      success: true,
      data: data || [],
      meta: {
        latitude: lat,
        longitude: lon,
        radius: radiusMeters,
        count: data?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching nearby deals:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch nearby deals' 
    });
  }
});

/**
 * POST /api/deals
 * Create a new deal with address and coordinates
 * Body: title, description, address, latitude, longitude, original_price, discounted_price
 */
// TODO: Add authenticateUser middleware once auth is implemented
// router.post('/', authenticateUser, async (req: Request, res: Response) => {
router.post('/', async (req: Request, res: Response) => {
  try {
    // TODO: Remove hardcoded userId once auth is implemented
    // const userId = req.user?.id;
    // if (!userId) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }
    const userId = '00000000-0000-0000-0000-000000000000'; // Temporary placeholder

    const {
      title,
      description,
      address,
      latitude,
      longitude,
      original_price,
      discounted_price,
    } = req.body;

    // Validate required fields
    if (!title || !address || latitude === undefined || longitude === undefined || !discounted_price) {
      return res.status(400).json({
        error: 'title, address, latitude, longitude, and discounted_price are required',
      });
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: 'Invalid latitude or longitude values',
      });
    }

    // Insert deal into database
    const { data, error } = await supabase
      .from('deals')
      .insert({
        title,
        description,
        address,
        geom: `POINT(${longitude} ${latitude})`, // PostGIS POINT format: POINT(lon lat)
        original_price,
        discounted_price,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create deal',
    });
  }
});

/**
 * GET /api/deals/:id
 * Get a single deal by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Deal not found' });
      }
      throw error;
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching deal:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch deal',
    });
  }
});

/**
 * PUT /api/deals/:id
 * Update a deal
 */
// TODO: Add authenticateUser middleware once auth is implemented
// router.put('/:id', authenticateUser, async (req: Request, res: Response) => {
router.put('/:id', async (req: Request, res: Response) => {
  try {
    // TODO: Remove hardcoded userId and add proper auth check once auth is implemented
    // const userId = req.user?.id;
    // if (!userId) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }

    const { id } = req.params;
    const updateData: any = { ...req.body };

    // Validate coordinates if they're being updated
    if (updateData.latitude !== undefined && updateData.longitude !== undefined) {
      const lat = updateData.latitude;
      const lon = updateData.longitude;
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return res.status(400).json({
          error: 'Invalid latitude or longitude values',
        });
      }
      // Convert to geom format and remove lat/lon from update
      updateData.geom = `POINT(${lon} ${lat})`;
      delete updateData.latitude;
      delete updateData.longitude;
    }

    // TODO: Uncomment once auth is implemented to check ownership
    // Check if user owns the deal
    // const { data: existingDeal, error: fetchError } = await supabase
    //   .from('deals')
    //   .select('created_by')
    //   .eq('id', id)
    //   .single();

    // if (fetchError || !existingDeal) {
    //   return res.status(404).json({ error: 'Deal not found' });
    // }

    // if (existingDeal.created_by !== userId) {
    //   return res.status(403).json({ error: 'Forbidden: You can only update your own deals' });
    // }

    // Update the deal
    updateData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('deals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Deal not found' });
      }
      throw error;
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to update deal',
    });
  }
});

/**
 * DELETE /api/deals/:id
 * Delete a deal
 */
// TODO: Add authenticateUser middleware once auth is implemented
// router.delete('/:id', authenticateUser, async (req: Request, res: Response) => {
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    // TODO: Remove hardcoded userId and add proper auth check once auth is implemented
    // const userId = req.user?.id;
    // if (!userId) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }

    const { id } = req.params;

    // TODO: Uncomment once auth is implemented to check ownership
    // Check if user owns the deal
    // const { data: existingDeal, error: fetchError } = await supabase
    //   .from('deals')
    //   .select('created_by')
    //   .eq('id', id)
    //   .single();

    // if (fetchError || !existingDeal) {
    //   return res.status(404).json({ error: 'Deal not found' });
    // }

    // if (existingDeal.created_by !== userId) {
    //   return res.status(403).json({ error: 'Forbidden: You can only delete your own deals' });
    // }

    // Delete the deal
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Deal not found' });
      }
      throw error;
    }

    res.json({
      success: true,
      message: 'Deal deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting deal:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to delete deal',
    });
  }
});

export default router;