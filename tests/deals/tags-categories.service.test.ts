import { supabase } from "../../src/config/supabase-client.js";
import {
  deleteDeal,
  getDeal,
  updateDeal,
} from "../../src/services/deals.service.js";
import { cleanupDeal, createTestDeal } from "./deals.util.js";

const TEST_USER_ID = "f84b1687-1625-47f1-94c0-c81d6b946db6";

describe("Deal Tags & Categories", () => {
  it("Create a deal with tags and categories", async () => {
    const deal = await createTestDeal(TEST_USER_ID, {
      title: "Tagged Deal",
      tags: ["Pizza", "Late Night"],
      categories: ["Restaurant"],
    });

    expect(deal.tags).toEqual(expect.arrayContaining(["pizza", "late night"]));
    expect(deal.categories).toEqual(expect.arrayContaining(["restaurant"]));

    await cleanupDeal(deal.id);
  });

  it("Create a deal with a nonexistent category", async () => {
    const deal = await createTestDeal(TEST_USER_ID, {
      title: "Deal w/ nonexistent category",
      categories: ["Nonexistent"],
    });

    expect(deal.categories).toEqual([]);

    await cleanupDeal(deal.id);
  });

  it("Update a deal’s tags and categories", async () => {
    const deal = await createTestDeal(TEST_USER_ID, {
      title: "Update Test Deal",
      tags: ["OldTag"],
      categories: ["Restaurant"],
    });

    const updated = await updateDeal(deal.id, {
      tags: ["NewTag"],
      categories: [],
    });

    expect(updated.tags).toEqual(expect.arrayContaining(["newtag"]));
    expect(updated.categories).toEqual([]);

    await cleanupDeal(deal.id);
  });

  it("Update a deal with a nonexistent category", async () => {
    const deal = await createTestDeal(TEST_USER_ID, {
      title: "Update Test Deal",
      categories: ["Restaurant"],
    });

    const updated = await updateDeal(deal.id, {
      categories: ["Nonexistent"],
    });

    expect(updated.categories).toEqual([]);

    await cleanupDeal(deal.id);
  });

  it("Fetch a deal and include tags/categories", async () => {
    const deal = await createTestDeal(TEST_USER_ID, {
      tags: ["Coffee"],
      categories: ["Restaurant"],
    });

    const fetched = await getDeal(deal.id);

    expect(fetched.tags).toEqual(expect.arrayContaining(["coffee"]));
    expect(fetched.categories).toEqual(expect.arrayContaining(["restaurant"]));

    await cleanupDeal(deal.id);
  });

  it("Delete a deal and its associated tags/categories", async () => {
    const deal = await createTestDeal(TEST_USER_ID, {
      title: "Delete Test Deal",
      tags: ["food", "yummy"],
      categories: ["Restaurant"],
    });

    const dealId = deal.id;

    const result = await deleteDeal(dealId);
    expect(result).toBeDefined();

    // Verify deal is removed
    const { data: dealData } = await supabase
      .from("deals")
      .select("*")
      .eq("id", dealId)
      .single();

    expect(dealData).toBeNull();

    // Verify deal_tags removed
    const { data: tags } = await supabase
      .from("deal_tags")
      .select("*")
      .eq("deal_id", dealId);

    expect(tags).toHaveLength(0);

    // Verify deal_categories removed
    const { data: categories } = await supabase
      .from("deal_categories")
      .select("*")
      .eq("deal_id", dealId);

    expect(categories).toHaveLength(0);

    await cleanupDeal(dealId); // Just in case
  });
});
