import { supabase } from "../../src/config/supabase-client.js";

export async function cleanupVotes(dealId: string) {
  await supabase.from("votes").delete().eq("deal_id", dealId);
}

export async function cleanupUserVotes(userId: string) {
  await supabase.from("votes").delete().eq("user_id", userId);
}
