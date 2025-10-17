import { supabase } from "../config/supabase-client.js";
import { DealInsert, Deal } from "../types/deals.types.js";

export async function createDeal(
  userId: string,
  deal: Omit<DealInsert, "created_by">, // Accept a deal of DealInsert type, excluding user id
): Promise<Deal> {
  const { data, error } = await supabase
    .from("deals")
    .insert([{ ...deal, created_by: userId }])
    .select()
    .single(); // return one object

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
    .single(); // return one object

  if (error) throw new Error("Deal not found");
  return data;
}

export async function getDeals() {}

export async function updateDeal() {}

export async function deleteDeal() {}
