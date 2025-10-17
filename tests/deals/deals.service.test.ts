import { createDeal, getDeal } from "../../src/services/deals.service.js";
import { supabase } from "../../src/config/supabase-client.js";

const TEST_USER_ID = "f84b1687-1625-47f1-94c0-c81d6b946db6"

// Test createDeal service
describe("createDeal service", () => {
  let insertedDealId: string;
  let tempLocationId: string;

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

    const createdDeal = await createDeal(TEST_USER_ID, testDealDataWithLocation);
    insertedDealId = createdDeal.id;

    expect(createdDeal).toHaveProperty("id");
    expect(createdDeal.created_by).toBe(TEST_USER_ID);
    expect(createdDeal.title).toBe(testDealData.title);
    expect(createdDeal.description).toBe(testDealData.description);
    expect(createdDeal.discounted_price).toBe(testDealData.discounted_price);
    expect(createdDeal).toHaveProperty("location_id");
    expect(createdDeal).toHaveProperty("created_at");
    expect(createdDeal).toHaveProperty("updated_at");
  });
});


// Test getDeal service (singular, by ID)
describe("getDeal service", () => {
  let insertedDealId: string;
  let tempLocationId: string;

  const testDealData = {
    title: "Test Deal",
    description: "This deal will be fetched in a test",
    discounted_price: 15,
  };

  beforeAll(async () => {
    // Create a temporary location
    const { data: location, error: locationError } = await supabase
      .from("locations")
      .insert([{ longitude: 0, latitude: 0 }])
      .select()
      .single();

    if (locationError) throw locationError;
    tempLocationId = location!.id;

    // Create a deal to later fetch
    const createdDeal = await createDeal(TEST_USER_ID, {
      ...testDealData,
      location_id: tempLocationId,
    });

    insertedDealId = createdDeal.id;
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
  });

  it("Should fetch a deal by ID and return it", async () => {
    const fetchedDeal = await getDeal(insertedDealId);

    expect(fetchedDeal).toBeDefined();
    expect(fetchedDeal.id).toBe(insertedDealId);
    expect(fetchedDeal.created_by).toBe(TEST_USER_ID);
    expect(fetchedDeal.title).toBe(testDealData.title);
    expect(fetchedDeal.description).toBe(testDealData.description);
    expect(fetchedDeal.discounted_price).toBe(testDealData.discounted_price);
    expect(fetchedDeal.location_id).toBe(tempLocationId);
  });

  it("Should throw an error when fetching a nonexistent deal", async () => {
    await expect(
      getDeal("00000000-0000-0000-0000-000000000000")
    ).rejects.toThrow("Deal not found");
  });
});
