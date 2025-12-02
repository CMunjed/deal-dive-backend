// src/services/deals.helpers.ts
import { supabase } from "../config/supabase-client.js";
import { Deal } from "../types/deals.types.js";

type DealWithRelations = Deal & {
  deal_tags?: { tags: { name_lower: string } }[];
  deal_categories?: { categories: { name_lower: string } }[];
};

interface FetchDealsOptions {
  ids?: string[];
  userId?: string;
}

/**
 * Fetch deals with their tags and categories in a single query.
 * Behavior:
 * - If 'options.ids' is provided, the query filters by those ids.
 * - If 'options.userId' is provided, the query filters by created_by = userId.
 * - If 'options.ids' contains exactly one id and no deal is found, this function
 *   will 'throw new Error("Deal not found")' (to preserve expected controller behavior).
 */
export async function fetchDealsWithRelations(
  options: FetchDealsOptions = {},
): Promise<(Deal & { tags: string[]; categories: string[] })[]> {
  // Join deals w/ deal_tags and deal_categories on deal.id,
  // join deal_tags w/ tags and deal_categories w/ categories
  // on tag.id and category.id, then select the name_lower field from each
  let query = supabase.from("deals").select(`
      *,
      deal_tags:deal_tags(tags(name_lower)),
      deal_categories:deal_categories(categories(name_lower))
    `);

  if (options.ids && options.ids.length > 0) {
    query = query.in("id", options.ids);
  }

  if (options.userId) {
    query = query.eq("created_by", options.userId);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as DealWithRelations[];

  // If caller asked for a single id, preserve the "Deal not found" behavior
  if (options.ids && options.ids.length === 1 && rows.length === 0) {
    throw new Error("Deal not found");
  }

  // Process each deal into desired format, replace deal_tags and deal_categories fields with tags and categories
  return rows.map((deal) => {
    const { deal_tags, deal_categories, ...rest } = deal;
    return {
      ...rest,
      tags: deal_tags?.map((t) => t.tags.name_lower) || [],
      categories: deal_categories?.map((c) => c.categories.name_lower) || [],
    };
  });
}
