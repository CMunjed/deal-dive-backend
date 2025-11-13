import { supabase } from "../config/supabase-client.js";
import { DealInsert, Deal } from "../types/deals.types.js";

// Helper function to upsert tags on deal creation
async function upsertTags(tagNames: string[]) {
  const lowerTags = tagNames.map((t) => ({ name: t, name_lower: t.toLowerCase() }));

  // Upsert based on unique lower name
  const { data, error } = await supabase
    .from("tags")
    .upsert(lowerTags, { onConflict: "name_lower" })
    .select();

  if (error) throw error;
  return data || [];
}

// Create new deal
export async function createDeal(
  userId: string,
  deal: Omit<DealInsert, "created_by"> // Accept a deal of DealInsert type, excluding user id (passed in separately)
  & { tags?: string[]; categories?: string[] }, // Allow a passed-in list of tags and categories along with the deal
): Promise<Deal> {

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

  // Handle tags
  if (tags.length > 0) {
    const upsertedTags = await upsertTags(tags);
    const dealTagLinks = upsertedTags.map((tag) => ({
      deal_id: dealId,
      tag_id: tag.id,
    }));
    // Link deal to its tags by creating new rows in deal_tags
    await supabase.from("deal_tags").insert(dealTagLinks);
  }

  // Handle categories (must already exist)
  if (categories.length > 0) {
    const { data: foundCategories, error: categoryError } = await supabase
      .from("categories")
      .select("id, name_lower")
      .in("name_lower", categories.map((c) => c.toLowerCase()));
    if (categoryError) throw categoryError;

    const dealCategoryLinks = (foundCategories || []).map((c) => ({
      deal_id: dealId,
      category_id: c.id,
    }));
    // Link deal to its categories by creating new rows in deal_categories
    if (dealCategoryLinks.length > 0)
      await supabase.from("deal_categories").insert(dealCategoryLinks);
  }

  // Return full deal with relations
  return await getDeal(dealId);
}


// Get one deal by ID
export async function getDeal(dealId: string): Promise<Deal & { tags: string[]; categories: string[] }> {
  const { data: deal, error } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .single();

  if (error || !deal) throw new Error("Deal not found");

  // Retrieve tags
  const { data: tags } = await supabase
    .from("deal_tags")
    .select("tags(name)")
    .eq("deal_id", dealId);

  // Retrieve categories
  const { data: categories } = await supabase
    .from("deal_categories")
    .select("categories(name)")
    .eq("deal_id", dealId);

  // Return deal and its tags + categories
  return {
    ...deal,
    tags: tags?.map((t) => t.tags.name) || [],
    categories: categories?.map((c) => c.categories.name) || [],
  };
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
  updates: Partial<Deal>,
): Promise<Deal> {
  // TODO: Either add a manual check or RLS to only allow users to update their own deals
  const { data, error } = await supabase
    .from("deals")
    .update(updates)
    .eq("id", dealId)
    .select()
    .maybeSingle(); // Return one object (the updated deal)

  if (error) {
    throw error;
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
    .maybeSingle(); // Return one object (the deleted deal)

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Deal not found");
  }

  return data;
}
