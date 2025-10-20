import { Request, Response } from "express";
import { addComment, getCommentsByDeal, deleteComment } from "../services/comments.service.js";

// POST /api/v1/deals/:id/comments
export async function addCommentController(req: Request, res: Response) {
  try {
    const { id: dealId } = req.params;
    const { userId, content } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ error: "userId and content are required" });
    }

    const comment = await addComment(userId, dealId, content);
    res.json(comment);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(400).json({ error: "Unknown error" });
    }
  }
}

// GET /api/v1/deals/:id/comments
export async function getCommentsController(req: Request, res: Response) {
  try {
    const { id: dealId } = req.params;
    const commentResult = await getCommentsByDeal(dealId);
    
    res.json({
      count: commentResult.totalCount,
      comments: commentResult.comments,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(400).json({ error: "Unknown error" });
    }
  }
}

// DELETE /api/v1/comments/:id
export async function deleteCommentController(req: Request, res: Response) {
  try {
    const { id: commentId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    await deleteComment(commentId, userId);
    res.json({ message: "Comment deleted successfully" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(400).json({ error: "Unknown error" });
    }
  }
}
