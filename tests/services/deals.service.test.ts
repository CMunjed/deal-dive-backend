import { createDeal } from "../../src/services/deals.service.js";
import { supabase } from "../../src/config/supabase-client.js";
//import { v4 as uuidv4 } from "uuid";

describe("createDeal service", () => {
  let insertedDealId: string;
  let tempLocationId: string;

  const testUserId = "f84b1687-1625-47f1-94c0-c81d6b946db6";

  const testDealData = {
    title: "Test Deal",
    description: "This is a test deal",
    discounted_price: 10,
  };

  beforeAll(async () => {
    // Create a temporary test user
    /*const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: `test-${Date.now()}@example.com`,
      password: "TestPassword123!",
    });

    if (userError) throw userError;
    tempUserId = user!.user.id;*/

    // Create a temporary location
    const { data: location, error: locationError } = await supabase
      .from("locations")
      .insert([{ longitude: 0, latitude: 0 }])
      .select()
      .single();

    if (locationError) throw locationError;
    tempLocationId = location!.id;
  });

  afterAll(async () => {
    // Clean up inserted deal
    if (insertedDealId) {
      await supabase.from("deals").delete().eq("id", insertedDealId);
    }

    // Clean up temporary location
    if (tempLocationId) {
      await supabase.from("locations").delete().eq("id", tempLocationId);
    }

    // Clean up temporary user
    /*if (tempUserId) {
      await supabase.auth.admin.deleteUser(tempUserId);
    }*/
  });

  it("Should create + insert a deal and return the created object", async () => {
    const testDealDataWithLocation = {...testDealData, location_id: tempLocationId}

    const createdDeal = await createDeal(testUserId, testDealDataWithLocation);
    insertedDealId = createdDeal.id;

    expect(createdDeal).toHaveProperty("id");
    expect(createdDeal.created_by).toBe(testUserId);
    expect(createdDeal.title).toBe(testDealData.title);
    expect(createdDeal.description).toBe(testDealData.description);
    expect(createdDeal.discounted_price).toBe(testDealData.discounted_price);
    expect(createdDeal).toHaveProperty("location_id");
    expect(createdDeal).toHaveProperty("created_at");
    expect(createdDeal).toHaveProperty("updated_at");
  });
});
