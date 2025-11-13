import { supabase } from "../config/supabase-client.js";
import { Category } from "../types/tags-categories.types.js";

// Fetch categories by their names (case-insensitive)
export async function getCategoriesByName(
  names: string[],
): Promise<Category[]> {
  if (!names.length) return [];

  const { data, error } = await supabase
    .from("categories")
    .select()
    .in(
      "name_lower",
      names.map((n) => n.toLowerCase()),
    );

  if (error) throw error;
  return data ?? [];
}

// Link a deal to existing categories and ignore any categories that don't exist
export async function linkDealCategories(
  dealId: string,
  categoryNames: string[],
): Promise<void> {
  if (categoryNames.length == 0) return;

  // Search for the passed-in categories, only link those that are valid + existing categories
  const foundCategories = await getCategoriesByName(categoryNames);
  if (foundCategories.length == 0) return;

  const dealCategoryLinks = foundCategories.map((c) => ({
    deal_id: dealId,
    category_id: c.id,
  }));

  await supabase.from("deal_categories").insert(dealCategoryLinks);
}

// Unlink all categories from a deal
export async function unlinkDealCategories(dealId: string): Promise<void> {
  await supabase.from("deal_categories").delete().eq("deal_id", dealId);
}
