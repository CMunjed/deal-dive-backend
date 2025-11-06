import { supabase } from "../config/supabase-client.js";
import { SavedDeal } from "../types/saved-deals.types.js";

// Save a deal
export async function saveDeal(userId: string, dealId: string): Promise<SavedDeal> {
  const { data, error } = await supabase
    .from("saved_deals")
    .insert([{ user_id: userId, deal_id: dealId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get all the user's saved deals
// export async function getSavedDeals(userId: string): Promise<null> { return null; }

// Remove a saved deal
export async function unsaveDeal(userId: string, dealId: string): Promise<null> { return null; }