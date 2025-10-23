import { supabase } from "../../src/config/supabase-client.js";
import { createDeal } from "../../src/services/deals.service.js";
import type { Deal } from "../../src/types/deals.types.js";

const defaultTestDeal: Partial<Deal> = {
  title: "Test Deal",
  description: "Used for testing",
  discounted_price: 10,
}

export async function createTestDeal(userId: string, overrides: Partial<Deal> = {}) {
  const dealData = {
    ...defaultTestDeal,
    title: overrides.title ?? defaultTestDeal.title!, // Required field
    discounted_price: overrides.discounted_price ?? defaultTestDeal.discounted_price!, // Required field
    ...overrides,
  };

  const deal = await createDeal(userId, dealData);
  return deal;
}

export async function cleanupDeal(dealId: string) {
  await supabase.from("deals").delete().eq("id", dealId);
}
