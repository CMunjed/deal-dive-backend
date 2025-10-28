import { supabase } from "../config/supabase-client.js";
import { Tables, TablesInsert } from "../types/database.types.js";

// Type definitions for comments
export type Comment = Tables<"comments">;
export type CommentInsert = TablesInsert<"comments">;

// Comment result type for getCommentsByDeal response
export type CommentResult = {
  comments: Comment[];
  totalCount: number;
};

// Add a new comment to a deal
export async function addComment(
  userId: string,
  dealId: string,
  content: string,
): Promise<Comment> {
  const { data, error } = await supabase
    .from("comments")
    .insert([{ user_id: userId, deal_id: dealId, content }])
    .select()
    .single();

  if (error) throw new Error(`Failed to add comment: ${error.message}`);
  return data;
}

// Get all comments for a specific deal
export async function getCommentsByDeal(
  dealId: string,
): Promise<CommentResult> {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to get comments: ${error.message}`);

  const comments = data || [];

  return {
    comments,
    totalCount: comments.length,
  };
}

// Delete a comment by ID (only by the user who created it)
export async function deleteComment(
  commentId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", userId);

  if (error) throw new Error(`Failed to delete comment: ${error.message}`);
}
