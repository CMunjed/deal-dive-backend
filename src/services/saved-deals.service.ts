import { supabase } from "../config/supabase-client.js";
import { Deal } from "../types/deals.types.js";
import { SavedDeal } from "../types/saved-deals.types.js";

// Save a deal
export async function saveDeal(
  userId: string,
  dealId: string,
): Promise<SavedDeal> {
  const { data, error } = await supabase
    .from("saved_deals")
    .insert([{ user_id: userId, deal_id: dealId }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Get all the user's saved deals
export async function getSavedDeals(userId: string): Promise<Deal[]> {
  // Fetch saved deal IDs for the user
  const { data: savedDealRows, error: savedDealFetchError } = await supabase
    .from("saved_deals")
    .select("deal_id")
    .eq("user_id", userId);

  if (savedDealFetchError) throw new Error("Error fetching saved deals");

  const savedIds = (savedDealRows ?? [])
    .map((r) => r.deal_id) // Get deal ids from saved deal rows
    .filter((id): id is string => id !== null); // Remove null values, ensure string typing

  if (savedIds.length === 0) return [];

  // Fetch deal rows from saved deal IDs
  // eslint-disable-next-line prefer-const
  let query = supabase.from("deals").select("*").in("id", savedIds);

  // TODO: Future filters can be applied here
  // query = applyOtherFilters(query, filters);

  const { data, error } = await query;
  if (error) throw error;

  return data ?? [];
}

// Remove a saved deal - Currently returns the deleted row instead of empty response
export async function unsaveDeal(
  userId: string,
  dealId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("saved_deals")
    .delete()
    .eq("user_id", userId)
    .eq("deal_id", dealId)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  // if (!data) throw new Error("Saved deal not found");

  return !!data; // True if row was deleted, false otherwise
}
