import {
  getSavedDeals,
  saveDeal,
  unsaveDeal,
} from "../../src/services/saved-deals.service.js";
import { createTestDeal, cleanupDeal } from "./deals.util.js";

const TEST_USER_ID = "f84b1687-1625-47f1-94c0-c81d6b946db6";

/*describe("Saved Deals Service Tests", () => {
  let tempDealId: string;
  let otherTempDealId: string;

  // Create a temporary deal before all tests
  beforeAll(async () => {
    const deal = await createTestDeal(TEST_USER_ID, {
      title: "Temp Deal (to test saving deals)",
    });
    tempDealId = deal.id;

    const otherDeal = await createTestDeal(TEST_USER_ID, {
      title: "Other User Deal",
    });
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

      expect(deleted).toBe(true); //.toBeDefined();
      // expect(deleted.user_id).toBe(TEST_USER_ID);
      // expect(deleted.deal_id).toBe(tempDealId);

      // Verify it is no longer returned in saved deals
      const savedDeals = await getSavedDeals(TEST_USER_ID);
      expect(savedDeals.some(d => d.id === tempDealId)).toBe(false);
    });

    //it("Should throw an error when unsaving a deal that is not saved", async () => {
    it("Should return false when unsaving a deal that is not saved", async () => {
      const deleted = await unsaveDeal(TEST_USER_ID, tempDealId); //rejects.toThrow();
      expect(deleted).toBe(false);
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
      const savedIds = savedDeals.map((d) => d.id);
      expect(savedIds).toEqual(
        expect.arrayContaining([tempDealId, otherTempDealId]),
      );
    });

    it("Should return an empty array for a user with no saved deals", async () => {
      const savedDeals = await getSavedDeals(
        "00000000-0000-0000-0000-000000000000",
      );
      expect(savedDeals).toEqual([]);
    });
  });
});*/

describe("Saved Deals Service Tests", () => {

  describe("saveDeal", () => {
    let dealId: string;

    beforeEach(async () => {
      const deal = await createTestDeal(TEST_USER_ID, { title: "Deal-Saving Test Deal" });
      dealId = deal.id;
    });

    afterEach(async () => {
      await unsaveDeal(TEST_USER_ID, dealId).catch(() => {});
      await cleanupDeal(dealId);
    });

    it("Should save a deal for the user", async () => {
      const saved = await saveDeal(TEST_USER_ID, dealId);
      expect(saved).toBeDefined();
      expect(saved.user_id).toBe(TEST_USER_ID);
      expect(saved.deal_id).toBe(dealId);
      expect(saved.created_at).toBeDefined();
    });

    // TODO: Consider handling gracefully instead in saved-deals.service.ts
    it("Should fail if trying to save the same deal again (unique constraint)", async () => {
      await saveDeal(TEST_USER_ID, dealId);
      await expect(saveDeal(TEST_USER_ID, dealId)).rejects.toThrow();
    });
  });

  describe("unsaveDeal", () => {
    let dealId: string;

    beforeEach(async () => {
      const deal = await createTestDeal(TEST_USER_ID, { title: "Deal-Saving Test Deal" });
      dealId = deal.id;
      await saveDeal(TEST_USER_ID, dealId);
    });

    afterEach(async () => {
      await unsaveDeal(TEST_USER_ID, dealId).catch(() => {});
      await cleanupDeal(dealId);
    });

    it("Should unsave a deal previously saved", async () => {
      const deleted = await unsaveDeal(TEST_USER_ID, dealId);
      expect(deleted).toBe(true);

      // If the deleted object is returned instead of a boolean
      // expect(deleted.user_id).toBe(TEST_USER_ID);
      // expect(deleted.deal_id).toBe(tempDealId);

      const savedDeals = await getSavedDeals(TEST_USER_ID);
      expect(savedDeals.some(d => d.id === dealId)).toBe(false);
    });

    // If changed to throw error: 
    // `it("Should throw an error when unsaving a deal that is not saved", async () => {`
    it("Should return false when unsaving a deal that is not saved", async () => {
      await unsaveDeal(TEST_USER_ID, dealId); // First unsave
      const result = await unsaveDeal(TEST_USER_ID, dealId); // Second unsave
      expect(result).toBe(false);
    });
  });

  describe("getSavedDeals", () => {
    let dealId1: string;
    let dealId2: string;

    beforeEach(async () => {
      const deal1 = await createTestDeal(TEST_USER_ID, { title: "Deal-Saving Test Deal 1" });
      const deal2 = await createTestDeal(TEST_USER_ID, { title: "Deal-Saving Test Deal 2" });
      dealId1 = deal1.id;
      dealId2 = deal2.id;

      await saveDeal(TEST_USER_ID, dealId1);
      await saveDeal(TEST_USER_ID, dealId2);
    });

    afterEach(async () => {
      await unsaveDeal(TEST_USER_ID, dealId1).catch(() => {});
      await unsaveDeal(TEST_USER_ID, dealId2).catch(() => {});
      await cleanupDeal(dealId1);
      await cleanupDeal(dealId2);
    });

    it("Should return deals saved by the given user", async () => {
      const savedDeals = await getSavedDeals(TEST_USER_ID);
      expect(savedDeals.length).toBeGreaterThanOrEqual(2);

      const savedIds = savedDeals.map(d => d.id);
      expect(savedIds).toEqual(expect.arrayContaining([dealId1, dealId2]));
    });

    it("Should return an empty array for a user with no saved deals", async () => {
      const savedDeals = await getSavedDeals("00000000-0000-0000-0000-000000000000");
      expect(savedDeals).toEqual([]);
    });
  });
});
