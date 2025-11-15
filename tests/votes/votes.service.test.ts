import {
  addVote,
  removeVote,
  getVotes,
  VOTE_TYPES,
} from "../../src/services/votes.service.js";
import { cleanupDeal, createTestDeal } from "../deals/deals.util.js";
import { cleanupVotes } from "./votes.util.js";

const TEST_USER_ID = "f84b1687-1625-47f1-94c0-c81d6b946db6";
const TEST_USER_ID_2 = "02112c00-ef33-44cb-952f-f2febc5065ea"; // Second user for testing

describe("Votes Service Tests", () => {
  let testDealId: string;

  beforeAll(async () => {
    const deal = await createTestDeal(TEST_USER_ID);
    testDealId = deal.id;
  });

  afterAll(async () => {
    if (testDealId) {
      await cleanupVotes(testDealId);
      await cleanupDeal(testDealId);
    }
  });

  afterEach(async () => {
    // Clean up votes after each test
    await cleanupVotes(testDealId);
  });

  describe("addVote", () => {
    it("should add an upvote to a deal", async () => {
      const vote = await addVote(TEST_USER_ID, testDealId, VOTE_TYPES.UPVOTE);

      expect(vote).toHaveProperty("id");
      expect(vote.user_id).toBe(TEST_USER_ID);
      expect(vote.deal_id).toBe(testDealId);
      expect(vote.vote_type).toBe(VOTE_TYPES.UPVOTE);
    });

    it("should add a downvote to a deal", async () => {
      const vote = await addVote(TEST_USER_ID, testDealId, VOTE_TYPES.DOWNVOTE);

      expect(vote).toHaveProperty("id");
      expect(vote.vote_type).toBe(VOTE_TYPES.DOWNVOTE);
    });

    it("should update existing vote when user votes again", async () => {
      // First vote: upvote
      await addVote(TEST_USER_ID, testDealId, VOTE_TYPES.UPVOTE);

      // Second vote: downvote (should update)
      const updatedVote = await addVote(
        TEST_USER_ID,
        testDealId,
        VOTE_TYPES.DOWNVOTE,
      );

      expect(updatedVote.vote_type).toBe(VOTE_TYPES.DOWNVOTE);

      // Verify only one vote exists for this user
      const voteResult = await getVotes(testDealId);
      expect(voteResult.totalCount).toBe(1);
    });

    it("should allow multiple users to vote on the same deal", async () => {
      await addVote(TEST_USER_ID, testDealId, VOTE_TYPES.UPVOTE);
      await addVote(TEST_USER_ID_2, testDealId, VOTE_TYPES.DOWNVOTE);

      const voteResult = await getVotes(testDealId);
      expect(voteResult.totalCount).toBe(2);
      expect(voteResult.upvotes).toBe(1);
      expect(voteResult.downvotes).toBe(1);
    });
  });

  describe("removeVote", () => {
    it("should remove a user's vote from a deal", async () => {
      await addVote(TEST_USER_ID, testDealId, VOTE_TYPES.UPVOTE);

      await removeVote(TEST_USER_ID, testDealId);

      const voteResult = await getVotes(testDealId);
      expect(voteResult.totalCount).toBe(0);
    });

    it("should not throw error when removing non-existent vote", async () => {
      await expect(removeVote(TEST_USER_ID, testDealId)).resolves.not.toThrow();
    });

    it("should only remove the specified user's vote", async () => {
      await addVote(TEST_USER_ID, testDealId, VOTE_TYPES.UPVOTE);
      await addVote(TEST_USER_ID_2, testDealId, VOTE_TYPES.DOWNVOTE);

      await removeVote(TEST_USER_ID, testDealId);

      const voteResult = await getVotes(testDealId);
      expect(voteResult.totalCount).toBe(1);
      expect(voteResult.votes[0].user_id).toBe(TEST_USER_ID_2);
    });
  });

  describe("getVotes", () => {
    it("should return empty vote result for deal with no votes", async () => {
      const voteResult = await getVotes(testDealId);

      expect(voteResult.votes).toEqual([]);
      expect(voteResult.totalCount).toBe(0);
      expect(voteResult.upvotes).toBe(0);
      expect(voteResult.downvotes).toBe(0);
    });

    it("should return all votes for a deal", async () => {
      await addVote(TEST_USER_ID, testDealId, VOTE_TYPES.UPVOTE);
      await addVote(TEST_USER_ID_2, testDealId, VOTE_TYPES.UPVOTE);

      const voteResult = await getVotes(testDealId);

      expect(voteResult.totalCount).toBe(2);
      expect(voteResult.upvotes).toBe(2);
      expect(voteResult.downvotes).toBe(0);
    });

    it("should correctly count upvotes and downvotes", async () => {
      await addVote(TEST_USER_ID, testDealId, VOTE_TYPES.UPVOTE);
      await addVote(TEST_USER_ID_2, testDealId, VOTE_TYPES.DOWNVOTE);

      const voteResult = await getVotes(testDealId);

      expect(voteResult.totalCount).toBe(2);
      expect(voteResult.upvotes).toBe(1);
      expect(voteResult.downvotes).toBe(1);
    });
  });
});
