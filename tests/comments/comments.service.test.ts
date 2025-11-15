import {
  addComment,
  getCommentsByDeal,
  deleteComment,
} from "../../src/services/comments.service.js";
import { cleanupDeal, createTestDeal } from "../deals/deals.util.js";
import { cleanupComments } from "./comments.util.js";

const TEST_USER_ID = "f84b1687-1625-47f1-94c0-c81d6b946db6";
const TEST_USER_ID_2 = "02112c00-ef33-44cb-952f-f2febc5065ea";

describe("Comments Service Tests", () => {
  let testDealId: string;

  beforeAll(async () => {
    const deal = await createTestDeal(TEST_USER_ID);
    testDealId = deal.id;
  });

  afterAll(async () => {
    if (testDealId) {
      await cleanupComments(testDealId);
      await cleanupDeal(testDealId);
    }
  });

  afterEach(async () => {
    await cleanupComments(testDealId);
  });

  describe("addComment", () => {
    it("should add a comment to a deal", async () => {
      const content = "This is a test comment";
      const comment = await addComment(TEST_USER_ID, testDealId, content);

      expect(comment).toHaveProperty("id");
      expect(comment.user_id).toBe(TEST_USER_ID);
      expect(comment.deal_id).toBe(testDealId);
      expect(comment.content).toBe(content);
      expect(comment).toHaveProperty("created_at");
    });

    it("should add multiple comments to the same deal", async () => {
      await addComment(TEST_USER_ID, testDealId, "First comment");
      await addComment(TEST_USER_ID, testDealId, "Second comment");

      const result = await getCommentsByDeal(testDealId);
      expect(result.totalCount).toBe(2);
    });

    it("should allow different users to comment on the same deal", async () => {
      await addComment(TEST_USER_ID, testDealId, "User 1 comment");
      await addComment(TEST_USER_ID_2, testDealId, "User 2 comment");

      const result = await getCommentsByDeal(testDealId);
      expect(result.totalCount).toBe(2);
      expect(result.comments[0].user_id).toBe(TEST_USER_ID);
      expect(result.comments[1].user_id).toBe(TEST_USER_ID_2);
    });
  });

  describe("getCommentsByDeal", () => {
    it("should return empty result for deal with no comments", async () => {
      const result = await getCommentsByDeal(testDealId);

      expect(result.comments).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it("should return all comments for a deal", async () => {
      await addComment(TEST_USER_ID, testDealId, "Comment 1");
      await addComment(TEST_USER_ID, testDealId, "Comment 2");
      await addComment(TEST_USER_ID_2, testDealId, "Comment 3");

      const result = await getCommentsByDeal(testDealId);

      expect(result.totalCount).toBe(3);
      expect(result.comments).toHaveLength(3);
    });

    it("should return comments ordered by creation time (oldest first)", async () => {
      const comment1 = await addComment(TEST_USER_ID, testDealId, "First");
      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));
      const comment2 = await addComment(TEST_USER_ID, testDealId, "Second");
      await new Promise((resolve) => setTimeout(resolve, 10));
      const comment3 = await addComment(TEST_USER_ID, testDealId, "Third");

      const result = await getCommentsByDeal(testDealId);

      expect(result.comments[0].id).toBe(comment1.id);
      expect(result.comments[1].id).toBe(comment2.id);
      expect(result.comments[2].id).toBe(comment3.id);
    });

    it("should not return comments from other deals", async () => {
      const otherDeal = await createTestDeal(TEST_USER_ID);
      await addComment(TEST_USER_ID, testDealId, "Comment on test deal");
      await addComment(TEST_USER_ID, otherDeal.id, "Comment on other deal");

      const result = await getCommentsByDeal(testDealId);

      expect(result.totalCount).toBe(1);
      expect(result.comments[0].deal_id).toBe(testDealId);

      // Cleanup
      await cleanupComments(otherDeal.id);
      await cleanupDeal(otherDeal.id);
    });
  });

  describe("deleteComment", () => {
    it("should delete a comment by the user who created it", async () => {
      const comment = await addComment(
        TEST_USER_ID,
        testDealId,
        "Comment to delete",
      );

      await deleteComment(comment.id, TEST_USER_ID);

      const result = await getCommentsByDeal(testDealId);
      expect(result.totalCount).toBe(0);
    });

    it("should not delete comment if userId doesn't match", async () => {
      const comment = await addComment(
        TEST_USER_ID,
        testDealId,
        "User 1's comment",
      );

      // Try to delete with different user
      await expect(
        deleteComment(comment.id, TEST_USER_ID_2),
      ).rejects.toThrow();

      // Comment should still exist
      const result = await getCommentsByDeal(testDealId);
      expect(result.totalCount).toBe(1);
    });

    it("should only delete the specified comment", async () => {
      const comment1 = await addComment(TEST_USER_ID, testDealId, "Comment 1");
      await addComment(TEST_USER_ID, testDealId, "Comment 2");

      await deleteComment(comment1.id, TEST_USER_ID);

      const result = await getCommentsByDeal(testDealId);
      expect(result.totalCount).toBe(1);
      expect(result.comments[0].content).toBe("Comment 2");
    });

    it("should handle deleting non-existent comment gracefully", async () => {
      await expect(
        deleteComment("00000000-0000-0000-0000-000000000000", TEST_USER_ID),
      ).rejects.toThrow();
    });
  });
});