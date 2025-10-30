import { deleteDeal, getDeal, getDeals, updateDeal } from "../../src/services/deals.service.js";
import { cleanupDeal, createTestDeal } from "./deals.util.js";

const TEST_USER_ID = "f84b1687-1625-47f1-94c0-c81d6b946db6"

// TODO: Consider using beforeEach and afterEach for setup to better isolate tests

describe("Deal Service Tests", () => {
  let tempDealId: string;

  // Create a temporary deal before all tests
  beforeAll(async () => {
    const deal = await createTestDeal(TEST_USER_ID);
    tempDealId = deal.id;
  });

  // Clean up temporary deal after all tests
  afterAll(async () => {
    if (tempDealId) await cleanupDeal(tempDealId);
  });

  // createDeal test
  describe("createDeal", () => {
    it("Create a new deal", async () => {
      const deal = await createTestDeal(TEST_USER_ID, {
        title: "Test Deal",
      });

      expect(deal).toHaveProperty("id");
      expect(deal.title).toBe("Test Deal");
      
      // Clean up deal
      await cleanupDeal(deal.id);
    });
  });

  // getDeal test
  describe("getDeal", () => {
    it("Fetch a deal by ID", async () => {
      const fetched = await getDeal(tempDealId);
      expect(fetched.id).toBe(tempDealId);
    });

    it("Throw an error when fetching a nonexistent deal", async () => {
      await expect(getDeal("00000000-0000-0000-0000-000000000000")).rejects.toThrow("Deal not found");
    });
  });

  // getDeals tests
  describe("getDeals", () => {
    it("Fetch all deals", async () => {
      const deals = await getDeals();
      expect(deals.length).toBeGreaterThan(0);
    });

    it("Filter deals by userId", async () => {
      const deals = await getDeals({createdBy: TEST_USER_ID});
      expect(deals.every(d => d.created_by === TEST_USER_ID)).toBe(true);
    });
  });

  describe("updateDeal", () => {
    it("Update a deal's title and return the updated deal", async () => {
      const newTitle = "Updated";
      const updatedDeal = await updateDeal(tempDealId, { title: newTitle });

      expect(updatedDeal).toBeDefined();
      expect(updatedDeal.id).toBe(tempDealId);
      expect(updatedDeal.title).toBe(newTitle);
      expect(updatedDeal.updated_at).not.toBeNull();
    });

    it("Throw an error when updating a nonexistent deal", async () => {
      await expect(
        updateDeal("00000000-0000-0000-0000-000000000000", {
          title: "This should not update",
        })
      ).rejects.toThrow("Deal not found");
    });
  });

  describe("deleteDeal", () => {
    let dealToDeleteId: string;

    beforeAll(async () => {
      const deal = await createTestDeal(TEST_USER_ID);
      dealToDeleteId = deal.id;
    });

    it("Delete a deal and make sure it's deleted", async () => {
      const deletedDeal = await deleteDeal(dealToDeleteId);

      // deleteDeal should still return the data of the deleted deal
      expect(deletedDeal).toBeDefined();
      expect(deletedDeal.id).toBe(dealToDeleteId);

      // Make sure the deal was deleted
      await expect(getDeal(dealToDeleteId)).rejects.toThrow("Deal not found");
    });

    it("Throw an error when deleting a nonexistent deal", async () => {
      await expect(
        deleteDeal("00000000-0000-0000-0000-000000000000")
      ).rejects.toThrow("Deal not found");
    });

  });

});
