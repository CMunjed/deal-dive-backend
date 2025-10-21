import { supabase } from "../config/supabase-client.js";
import { Tables, TablesInsert } from "../types/database.types.js";

// Type definitions for votes
export type Vote = Tables<"votes">;
export type VoteInsert = TablesInsert<"votes">;

// Vote type constants
export const VOTE_TYPES = {
  DOWNVOTE: -1,
  UPVOTE: 1,
} as const;

// Vote result type for getVotes response
export type VoteResult = {
  votes: Vote[];
  totalCount: number;
  upvotes: number;
  downvotes: number;
};

// Add or update a vote for a user on a deal
export async function addVote(
  userId: string,
  dealId: string,
  vote_type: number
): Promise<Vote> {
  const { data, error } = await supabase
    .from("votes")
    .upsert(
      { user_id: userId, deal_id: dealId, vote_type },
      { onConflict: "user_id,deal_id" }
    )
    .select()
    .single();

  if (error) throw new Error(`Failed to add vote: ${error.message}`);
  return data;
}

// Remove a user's vote on a deal
export async function removeVote(
  userId: string,
  dealId: string
): Promise<void> {
  const { error } = await supabase
    .from("votes")
    .delete()
    .eq("user_id", userId)
    .eq("deal_id", dealId);

  if (error) throw new Error(`Failed to remove vote: ${error.message}`);
}

// Get all votes and total count for a deal
export async function getVotes(dealId: string): Promise<VoteResult> {
  const { data, error } = await supabase
    .from("votes")
    .select("*")
    .eq("deal_id", dealId);

  if (error) throw new Error(`Failed to get votes: ${error.message}`);

  const votes = data || [];
  const upvotes = votes.filter(vote => vote.vote_type === VOTE_TYPES.UPVOTE).length;
  const downvotes = votes.filter(vote => vote.vote_type === VOTE_TYPES.DOWNVOTE).length;

  return {
    votes,
    totalCount: votes.length,
    upvotes,
    downvotes,
  };
}
