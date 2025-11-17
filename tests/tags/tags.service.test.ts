import { supabase } from "../../src/config/supabase-client.js";
import {
  upsertTags,
  linkDealTags,
  unlinkDealTags,
} from "../../src/services/tags.service.js";
import { cleanupDeal, createTestDeal } from "../deals/deals.util.js";

const TEST_USER_ID = "f84b1687-1625-47f1-94c0-c81d6b946db6";

describe("Tags Service", () => {
  let testDealId: string;

  beforeAll(async () => {
    // Create test deal to perform tag operations on
    const deal = await createTestDeal(TEST_USER_ID);
    testDealId = deal.id;
  });

  afterEach(async () => {
    // Clean up test deal_tag relations
    await supabase.from("deal_tags").delete().eq("deal_id", testDealId);
    await supabase
      .from("tags")
      .delete() // Clean up the test tags we used
      .in("name_lower", ["test_tag1___", "test_tag2___"]);
  });

  afterAll(async () => {
    await cleanupDeal(testDealId);
  });

  it("upsertTags should create new tags and return them", async () => {
    const tags = await upsertTags(["Test_tag1___", "Test_tag2___"]);
    expect(tags).toHaveLength(2);
    expect(tags.map((t) => t.name_lower)).toEqual(
      expect.arrayContaining(["test_tag1___", "test_tag2___"]),
    );
  });

  it("upsertTags should return an empty array if the input is empty", async () => {
    const tags = await upsertTags([]);
    expect(tags).toEqual([]);
  });

  it("linkDealTags should link tags to a deal, creating missing tags", async () => {
    await linkDealTags(testDealId, ["Test_tag1___", "Test_tag2___"]);

    const { data: links, error: linkError } = await supabase
      .from("deal_tags")
      .select("tag_id")
      .eq("deal_id", testDealId);

    expect(linkError).toBeNull();
    expect(links).toHaveLength(2);

    const { data: tags, error: tagError } = await supabase
      .from("tags")
      .select("id, name_lower")
      .in(
        "id",
        links!.map((l) => l.tag_id),
      );

    expect(tagError).toBeNull();
    expect(tags!.map((t) => t.name_lower)).toEqual(
      expect.arrayContaining(["test_tag1___", "test_tag2___"]),
    );
  });

  it("linkDealTags should do nothing if tag array is empty", async () => {
    await linkDealTags(testDealId, []);
    const { data: links } = await supabase
      .from("deal_tags")
      .select("*")
      .eq("deal_id", testDealId);
    expect(links).toHaveLength(0);
  });

  
  it("unlinkDealTags should remove all tags linked to a deal", async () => {
    await linkDealTags(testDealId, ["test_tag1___", "test_tag2___"]);

    await unlinkDealTags(testDealId);

    const { data: links } = await supabase
      .from("deal_tags")
      .select("*")
      .eq("deal_id", testDealId);

    expect(links).toHaveLength(0);
  });
});
