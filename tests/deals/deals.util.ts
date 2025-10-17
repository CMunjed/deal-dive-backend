import { supabase } from "../../src/config/supabase-client.js";
import { createDeal } from "../../src/services/deals.service.js";
import type { Deal } from "../../src/types/deals.types.js";

const defaultTestDeal: Partial<Deal> = {
  title: "Default Test Deal",
  description: "Used for testing",
  discounted_price: 10,
}

export async function createTestLocation() {
  const { data, error } = await supabase
    .from("locations")
    .insert([{ latitude: 0, longitude: 0 }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createTestDeal(userId: string, overrides: Partial<Deal> = {}) {
  const location = await createTestLocation();

  const dealData = {
    ...defaultTestDeal,
    title: overrides.title ?? defaultTestDeal.title!, // Always include required field
    discounted_price: overrides.discounted_price ?? defaultTestDeal.discounted_price!, // Always include required field
    location_id: location.id,
    ...overrides,
  };

  const deal = await createDeal(userId, dealData);
  return { deal, location };
}

export async function cleanupDeal(dealId: string) {
  await supabase.from("deals").delete().eq("id", dealId);
}

export async function cleanupLocation(locationId: string) {
  await supabase.from("locations").delete().eq("id", locationId);
}