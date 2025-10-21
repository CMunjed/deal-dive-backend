import { createDeal, getDeal } from "../../src/services/deals.service.js";
//import { supabase } from "../../src/config/supabase-client.js";
import { cleanupDeal, createTestDeal } from "./deals.util.js";

const TEST_USER_ID = "f84b1687-1625-47f1-94c0-c81d6b946db6"

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
  /*describe("getDeals", () => {
    it("should fetch all deals", async () => {
      const deals = await getDeals();
      expect(deals.length).toBeGreaterThan(0);
    });

    it("should filter deals by userId", async () => {
      const deals = await getDeals(TEST_USER_ID);
      expect(deals.every(d => d.created_by === TEST_USER_ID)).toBe(true);
    });*/

  });
