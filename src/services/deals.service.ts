import { supabase } from "../config/supabase-client.js";
import { DealInsert, Deal } from "../types/deals.types.js";

// Create new deal
export async function createDeal(
  userId: string,
  deal: Omit<DealInsert, "created_by">, // Accept a deal of DealInsert type, excluding user id (passed in separately)
): Promise<Deal> {
  const { data, error } = await supabase
    .from("deals")
    .insert([{ ...deal, created_by: userId }])
    .select()
    .single(); // Return one object (the created deal)

  if (error) throw error;
  return data;
}

// Get one deal by ID
export async function getDeal(
  dealId: string
): Promise<Deal> {
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .single(); // Return one object (the fetched deal)

  if (error) throw new Error("Deal not found");
  return data;
}

// Get multiple deals - currently, either get all deals, or filter by user id
export async function getDeals(userId?: string): Promise<Deal[]> {
  let query = supabase.from("deals").select("*");

  // If userId is provided, filter by it
  if (userId) {
    query = query.eq("created_by", userId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data ?? []; // Return all fetched matching deals
}

/* TODO - getDeals with multiple filters
export async function getDeals(filters?: { userId?: string; tag?: string; location?: string }): Promise<Deal[]> {
  let query = supabase.from("deals").select("*");

  if (filters?.userId) query = query.eq("created_by", filters.userId);
  if (filters?.tag) query = query.contains("tags", [filters.tag]);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
} 
*/

export async function updateDeal( 
  dealId: string,
  updates: Partial<Deal>
): Promise<Deal> {
  // TODO: Either add a manual check or RLS to only allow users to update their own deals
  const { data, error } = await supabase
    .from("deals")
    .update(updates)
    .eq("id", dealId)
    .select()
    .single(); // Return one object (the updated deal)

  if (error) {
    throw new Error(`Failed to update deal: ${error.message}`);
  }

  if (!data) {
    throw new Error("Deal not found");
  }

  return data;
}

export async function deleteDeal(dealId: string): Promise<Deal> {
  // TODO: Either add a manual check or RLS to only allow users to delete their own deals
  const { data, error } = await supabase
    .from("deals")
    .delete()
    .eq("id", dealId)
    .select()
    .single(); // Return one object (the deleted deal)

  if (error) {
    throw new Error(`Failed to delete deal: ${error.message}`);
  }

  if (!data) {
    throw new Error("Deal not found");
  }

  return data;
}
