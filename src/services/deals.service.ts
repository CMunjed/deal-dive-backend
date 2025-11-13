import { supabase } from "../config/supabase-client.js";
import { DealInsert, Deal } from "../types/deals.types.js";
import {
  linkDealCategories,
  unlinkDealCategories,
} from "./categories.service.js";
import { linkDealTags, unlinkDealTags } from "./tags.service.js";

// Helper type for getDeal and getDeals, represents deal object with joined tables
type DealWithRelations = Deal & {
  deal_tags?: { tags: { name_lower: string } }[];
  deal_categories?: { categories: { name_lower: string } }[];
};

// Create new deal
export async function createDeal(
  userId: string,
  deal: Omit<DealInsert, "created_by"> & {
    // Accept a deal of DealInsert type, excluding user id (passed in separately)
    tags?: string[];
    categories?: string[];
  }, // Allow a passed-in list of tags and categories along with the deal
): Promise<Deal & { tags: string[]; categories: string[] }> {
  const { tags = [], categories = [], ...dealData } = deal;

  // Create deal in DB
  const { data: newDeal, error: dealError } = await supabase
    .from("deals")
    .insert([{ ...dealData, created_by: userId }])
    .select()
    .single();

  if (dealError) throw dealError;
  // if (!newDeal) throw new Error("message here");

  const dealId = newDeal.id;

  // Handle tags and categories
  if (tags.length > 0) await linkDealTags(dealId, tags);
  if (categories.length > 0) await linkDealCategories(dealId, categories);

  // Return full deal with relations
  return await getDeal(dealId);
}

// Get one deal by ID
export async function getDeal(
  dealId: string,
): Promise<Deal & { tags: string[]; categories: string[] }> {
  const { data, error } = await supabase
    .from("deals")
    .select(
      `
      *,
      deal_tags:deal_tags(tags(name_lower)),
      deal_categories:deal_categories(categories(name_lower))
    `,
    )
    .eq("id", dealId)
    .single();

  if (error || !data) throw new Error("Deal not found");

  const { deal_tags, deal_categories, ...rest } = data as DealWithRelations;

  return {
    ...rest,
    tags: deal_tags?.map((t) => t.tags.name_lower) || [],
    categories: deal_categories?.map((c) => c.categories.name_lower) || [],
  };
}

// Get multiple deals - currently, either get all deals, or filter by user id
export async function getDeals(
  userId?: string,
): Promise<(Deal & { tags: string[]; categories: string[] })[]> {
  /*let query = supabase.from("deals").select("*");

  // If userId is provided, filter by it
  if (userId) {
    query = query.eq("created_by", userId);
  }

  const { data: deals, error } = await query;
  if (error) throw error;

  // Fetch full deals with tags/categories
  const fullDeals = await Promise.all(deals.map((d) => getDeal(d.id)));

  return fullDeals ?? []; // Return all fetched matching deals*/

  let query = supabase.from("deals").select(`
      *,
      deal_tags:deal_tags(tags(name_lower)),
      deal_categories:deal_categories(categories(name_lower))
    `);

  if (userId) {
    query = query.eq("created_by", userId);
  }

  const { data, error } = await query;

  if (error) throw error;

  // If no deals found, return empty array
  if (!data) return [];

  // Map tags and categories to arrays of strings
  /*return data.map((deal: any) => ({
    ...deal,
    tags: deal.deal_tags?.map((t: any) => t.tags.name_lower) || [],
    categories: deal.deal_categories?.map((c: any) => c.categories.name_lower) || [],
  }));*/

  return (Array.isArray(data) ? data : [data]).map((deal) => {
    const { deal_tags, deal_categories, ...rest } = deal as DealWithRelations;

    return {
      ...rest,
      tags: deal_tags?.map((t) => t.tags.name_lower) || [],
      categories: deal_categories?.map((c) => c.categories.name_lower) || [],
    };
  });
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
  updates: Partial<
    Omit<Deal, "id" | "created_by" | "created_at" | "updated_at">
  > & { tags?: string[]; categories?: string[] },
): Promise<Deal & { tags: string[]; categories: string[] }> {
  const { tags, categories, ...dealData } = updates;

  // Verify deal exists
  const { data: existing, error: fetchError } = await supabase
    .from("deals")
    .select("id")
    .eq("id", dealId)
    .single();

  if (fetchError || !existing) throw new Error("Deal not found");

  // Update deal in deals table
  const { error: updateError } = await supabase
    .from("deals")
    .update({ ...dealData, updated_at: new Date().toISOString() })
    .eq("id", dealId)
    .select()
    .single();

  if (updateError) throw updateError;

  if (tags) {
    await unlinkDealTags(dealId);
    if (tags.length > 0) await linkDealTags(dealId, tags);
  }

  if (categories) {
    await unlinkDealCategories(dealId);
    if (categories.length > 0) await linkDealCategories(dealId, categories);
  }

  // Return updated deal with tags + categories
  return getDeal(dealId);
}

export async function deleteDeal(dealId: string): Promise<Deal> {
  const deal = await getDeal(dealId).catch(() => null);
  if (!deal) throw new Error("Deal not found");

  // Delete deal (cascade removes associated deal_tags and deal_categories relationships)
  const { error } = await supabase.from("deals").delete().eq("id", dealId);
  if (error) throw error;

  return deal; // Useful in assertions in tests
}
