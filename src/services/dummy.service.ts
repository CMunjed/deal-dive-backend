import { supabase } from "../config/supabase-client.js";

export async function getDummyData() {
    const { data, error } = await supabase.from("dummy").select("*");
    if (error) throw error;
    return data;
}
