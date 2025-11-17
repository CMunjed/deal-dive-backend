import { supabase } from "../config/supabase-client.js";
import { Deal } from "../types/deals.types.js";
import { SavedDeal } from "../types/saved-deals.types.js";
import { fetchDealsWithRelations } from "./deals.helpers.js";

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

  // Currently throws an error if a deal is already saved
  // TODO: Consider handling gracefully instead
  if (error) throw new Error(error.message);
  return data;
}

// Get all the user's saved deals
export async function getSavedDeals(
  userId: string,
): Promise<(Deal & { tags: string[]; categories: string[] })[]> {
  // Fetch saved deal IDs for the user
  const { data: savedDealRows, error: savedDealFetchError } = await supabase
    .from("saved_deals")
    .select("deal_id")
    .eq("user_id", userId);

  if (savedDealFetchError) throw new Error(savedDealFetchError.message);
  // throw new Error("Error fetching saved deals");

  const savedIds = (savedDealRows ?? [])
    .map((r) => r.deal_id) // Get deal ids from saved deal rows
    .filter((id): id is string => id !== null); // Remove null values, ensure string typing

  if (savedIds.length === 0) return [];

  // Fetch deal rows from saved deal IDs, with tags + categories
  return fetchDealsWithRelations({ ids: savedIds });
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

  // If throwing an error for unsaving an already unsaved deal
  // if (!data) throw new Error("Saved deal not found");

  return !!data; // True if row was deleted, false otherwise
}
