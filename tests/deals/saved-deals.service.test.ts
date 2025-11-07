import { getSavedDeals, saveDeal, unsaveDeal } from "../../src/services/saved-deals.service.js";
import { createTestDeal, cleanupDeal } from "./deals.util.js";

const TEST_USER_ID = "f84b1687-1625-47f1-94c0-c81d6b946db6";

describe("Saved Deals Service Tests", () => {
  let tempDealId: string;
  let otherTempDealId: string;

  // Create a temporary deal before all tests
  beforeAll(async () => {
    const deal = await createTestDeal(TEST_USER_ID, { title: "Temp Deal (to test saving deals)" });
    tempDealId = deal.id;

    const otherDeal = await createTestDeal(TEST_USER_ID, { title: "Other User Deal" });
    otherTempDealId = otherDeal.id;
  });

  // Clean up temporary deal after all tests
  afterAll(async () => {
    if (tempDealId) await cleanupDeal(tempDealId);
  });


  describe("saveDeal", () => {
    it("Should save a deal for the user", async () => {
      const saved = await saveDeal(TEST_USER_ID, tempDealId);

      expect(saved).toBeDefined();
      expect(saved.user_id).toBe(TEST_USER_ID);
      expect(saved.deal_id).toBe(tempDealId);
      expect(saved.created_at).toBeDefined();
    });

    it("Should fail if trying to save the same deal again (unique constraint)", async () => {
      // First save is already done in preceding test
      await expect(saveDeal(TEST_USER_ID, tempDealId)).rejects.toThrow();
    });
  });


  describe("unsaveDeal", () => {
    it("Should unsave a deal previously saved", async () => {
      const deleted = await unsaveDeal(TEST_USER_ID, tempDealId);

      expect(deleted).toBeDefined();
      expect(deleted.user_id).toBe(TEST_USER_ID);
      expect(deleted.deal_id).toBe(tempDealId);

      // TODO: Verify it is no longer returned in saved deals
    });

    it("Should throw an error when unsaving a deal that is not saved", async () => {
      await expect(unsaveDeal(TEST_USER_ID, tempDealId)).rejects.toThrow("Saved deal not found");
    });
  });


  describe("getSavedDeals", () => {
    beforeAll(async () => {
      // Save already-created deals for testing
      await saveDeal(TEST_USER_ID, tempDealId);
      await saveDeal(TEST_USER_ID, otherTempDealId);
    });

    afterAll(async () => {
      // Clean up saved deals
      await unsaveDeal(TEST_USER_ID, tempDealId).catch(() => {});
      await unsaveDeal(TEST_USER_ID, otherTempDealId).catch(() => {});
    });

    it("Should return deals saved by the given user", async () => {
      const savedDeals = await getSavedDeals(TEST_USER_ID);
      expect(savedDeals.length).toBeGreaterThan(0);
      // Ensure our test deals are included
      const savedIds = savedDeals.map(d => d.id);
      expect(savedIds).toEqual(expect.arrayContaining([tempDealId, otherTempDealId]));
    });

    it("Should return an empty array for a user with no saved deals", async () => {
      const savedDeals = await getSavedDeals("00000000-0000-0000-0000-000000000000");
      expect(savedDeals).toEqual([]);
    });
  });

});