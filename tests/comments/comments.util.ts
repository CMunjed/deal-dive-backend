import { supabase } from "../../src/config/supabase-client.js";

export async function cleanupComments(dealId: string) {
  await supabase.from("comments").delete().eq("deal_id", dealId);
}

export async function cleanupUserComments(userId: string) {
  await supabase.from("comments").delete().eq("user_id", userId);
}
