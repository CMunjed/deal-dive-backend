import { supabase } from "../../src/config/supabase-client.js";

export async function cleanupReports(dealId: string) {
  await supabase.from("reports").delete().eq("deal_id", dealId);
}

export async function cleanupUserReports(userId: string) {
  await supabase.from("reports").delete().eq("reporter_id", userId);
}
