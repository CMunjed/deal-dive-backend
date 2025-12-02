import { supabase } from "../config/supabase-client.js";
import { Tag } from "../types/tags-categories.types.js";

// Upsert tags on deal creation (tags are user-generated)
export async function upsertTags(tagNames: string[]): Promise<Tag[]> {
  if (tagNames.length === 0) return [];

  const rowsToInsert = tagNames.map((name) => ({ name: name.trim() }));

  const { data, error } = await supabase
    .from("tags")
    .upsert(rowsToInsert, { onConflict: "name_lower" }) // Uses the generated column for uniqueness
    .select();

  if (error) throw error;
  return data ?? [];
}

// Link a deal to a set of tags (and create tags if they don't exist)
export async function linkDealTags(
  dealId: string,
  tagNames: string[],
): Promise<void> {
  if (tagNames.length == 0) return;

  const upsertedTags = await upsertTags(tagNames);

  const dealTagLinks = upsertedTags.map((tag) => ({
    deal_id: dealId,
    tag_id: tag.id,
  }));

  await supabase.from("deal_tags").insert(dealTagLinks);
}

// Unlink all tags from a deal
export async function unlinkDealTags(dealId: string): Promise<void> {
  await supabase.from("deal_tags").delete().eq("deal_id", dealId);
}
