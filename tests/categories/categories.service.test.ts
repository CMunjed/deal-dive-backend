import { supabase } from "../../src/config/supabase-client.js";
import {
  getAllCategories,
  getCategoriesByName,
  linkDealCategories,
  unlinkDealCategories,
} from "../../src/services/categories.service.js";
import { cleanupDeal, createTestDeal } from "../deals/deals.util.js";

const TEST_USER_ID = "f84b1687-1625-47f1-94c0-c81d6b946db6";

describe("Category Service Tests", () => {
  let testDealId: string;
  let testCategory1: string;
  let testCategory2: string;

  beforeAll(async () => {
    // Create two test categories in DB (only these two should link)
    testCategory1 = "test_category_1";
    testCategory2 = "test_category_2";

    await supabase
      .from("categories")
      .insert([{ name: testCategory1 }, { name: testCategory2 }]);

    // Create a deal to link categories to
    const deal = await createTestDeal(TEST_USER_ID);
    testDealId = deal.id;
  });

  afterAll(async () => {
    // Delete deal (cascade removes deal_categories)
    cleanupDeal(testDealId);

    // Cleanup categories
    await supabase
      .from("categories")
      .delete()
      .in("name_lower", [testCategory1, testCategory2]);
  });

  it("getAllCategories returns list including our test categories", async () => {
    const categories = await getAllCategories();

    expect(categories.length).toBeGreaterThan(0);

    const expected = [testCategory1.toLowerCase(), testCategory2.toLowerCase()];
    const returned = categories.map((c) => c.name_lower);

    expected.forEach((name) => {
      expect(returned).toContain(name);
    });
  });

  it("getCategoriesByName returns only existing categories", async () => {
    const categories = await getCategoriesByName([
      testCategory1,
      "nonexistent_category_123_adfasd",
    ]);

    expect(categories).toHaveLength(1);
    expect(categories[0].name_lower).toBe(testCategory1);
  });

  it("linkDealCategories links only existing categories", async () => {
    await unlinkDealCategories(testDealId); // Clean slate

    await linkDealCategories(testDealId, [
      testCategory1,
      "invalidCategoryXYZadfadf",
      testCategory2,
    ]);

    const { data: links, error } = await supabase
      .from("deal_categories")
      .select("category_id, categories(name_lower)")
      .eq("deal_id", testDealId);

    expect(error).toBeNull();
    expect(links).toHaveLength(2);

    const linkedNames = links!.map((l) => l.categories.name_lower);
    expect(linkedNames).toEqual(
      expect.arrayContaining([testCategory1, testCategory2]),
    );
  });

  it("unlinkDealCategories removes all category links", async () => {
    // Link categories again (clean slate)
    await linkDealCategories(testDealId, [testCategory1, testCategory2]);

    // Unlink them
    await unlinkDealCategories(testDealId);

    const { data: links } = await supabase
      .from("deal_categories")
      .select()
      .eq("deal_id", testDealId);

    expect(links).toHaveLength(0);
  });
});
