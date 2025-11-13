import { supabase } from "../config/supabase-client.js";
import { DealInsert, Deal } from "../types/deals.types.js";
import { linkDealCategories, unlinkDealCategories } from "./categories.service.js";
import { linkDealTags, unlinkDealTags } from "./tags.service.js";

// Create new deal
export async function createDeal(
  userId: string,
  deal: Omit<DealInsert, "created_by"> // Accept a deal of DealInsert type, excluding user id (passed in separately)
  & { tags?: string[]; categories?: string[] }, // Allow a passed-in list of tags and categories along with the deal
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
  /*
  // Handle tags
  if (tags.length > 0) {
    const upsertedTags = await upsertTags(tags);
    const dealTagLinks = upsertedTags.map((t) => ({
      deal_id: dealId,
      tag_id: t.id,
    }));
    // Link deal to its tags by creating new rows in deal_tags
    // await supabase.from("deal_tags").insert(dealTagLinks);
    const { error: linkError } = await supabase
      .from("deal_tags")
      .insert(dealTagLinks)
      .select(); // Ensures we wait until rows exist

      if (linkError) throw linkError;
  }

  // Handle categories (must already exist)
  if (categories.length > 0) {
    // Only set categories if they exist
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
    if (dealCategoryLinks.length > 0) {
      //await supabase.from("deal_categories").insert(dealCategoryLinks);
      const { error: categoryLinkError } = await supabase
        .from("deal_categories")
        .insert(dealCategoryLinks)
        .select(); // Ensures rows exist
      if (categoryLinkError) throw categoryLinkError;
    }
  }*/

  // Handle tags and categories
  if (tags.length > 0) await linkDealTags(dealId, tags);
  if (categories.length > 0) await linkDealCategories(dealId, categories);

  // Return full deal with relations
  return await getDeal(dealId);
}


// Get one deal by ID
export async function getDeal(dealId: string): Promise<Deal & { tags: string[]; categories: string[] }> {
  const { data, error } = await supabase
    .from("deals")
    .select(`
      *,
      deal_tags:deal_tags(tags(name_lower)),
      deal_categories:deal_categories(categories(name_lower))
    `)
    .eq("id", dealId)
    .single();

  if (error || !data) throw new Error("Deal not found");

  return {
    ...data,
    tags: data.deal_tags?.map((t: any) => t.tags.name_lower) || [],
    categories: data.deal_categories?.map((c: any) => c.categories.name_lower) || [],
  };
}

// Get multiple deals - currently, either get all deals, or filter by user id
export async function getDeals(userId?: string): Promise<Deal[]> {
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

  let query = supabase
    .from("deals")
    .select(`
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
  return data.map((deal: any) => ({
    ...deal,
    tags: deal.deal_tags?.map((t: any) => t.tags.name_lower) || [],
    categories: deal.deal_categories?.map((c: any) => c.categories.name_lower) || [],
  }));
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

  /*
  // Handle tags
  if (tags) {
    // Remove old tags
    await supabase.from("deal_tags").delete().eq("deal_id", dealId);

    if (tags.length > 0) {
      const upsertedTags = await upsertTags(tags);
      const linkRows = upsertedTags.map((t) => ({
        deal_id: dealId,
        tag_id: t.id,
      }));
      await supabase.from("deal_tags").insert(linkRows);
    }
  }

  // Handle categories
  if (categories) {
    // Remove old categories
    await supabase.from("deal_categories").delete().eq("deal_id", dealId);

    // Only set categories if they exist
    if (categories.length > 0) {
      const { data: foundCategories, error: categoryError } = await supabase
        .from("categories")
        .select("id, name_lower")
        .in("name_lower", categories.map((c) => c.toLowerCase()));

      if (categoryError) throw categoryError;

      const linkRows = (foundCategories || []).map((c) => ({
        deal_id: dealId,
        category_id: c.id,
      }));
      if (linkRows.length > 0)
        await supabase.from("deal_categories").insert(linkRows);
    }
  }*/

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
