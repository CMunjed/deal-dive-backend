import { Request, Response } from "express";
import { addVote, removeVote, getVotes } from "../services/votes.service.js";

// POST /api/v1/deals/:id/vote
export async function addVoteController(req: Request, res: Response) {
  try {
    const { id: dealId } = req.params;
    const { userId, vote_type } = req.body;

    if (!userId || vote_type === undefined) {
      return res.status(400).json({ error: "userId and vote_type are required" });
    }

    const vote = await addVote(userId, dealId, vote_type);
    res.json(vote);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(400).json({ error: "Unknown error" });
    }
  }
}

// DELETE /api/v1/deals/:id/vote
export async function removeVoteController(req: Request, res: Response) {
  try {
    const { id: dealId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    await removeVote(userId, dealId);
    res.json({ message: "Vote removed successfully" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(400).json({ error: "Unknown error" });
    }
  }
}

// GET /api/v1/deals/:id/votes
export async function getVotesController(req: Request, res: Response) {
  try {
    const { id: dealId } = req.params;
    const voteResult = await getVotes(dealId);
    
    res.json({
      count: voteResult.totalCount,
      votes: voteResult.votes,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(400).json({ error: "Unknown error" });
    }
  }
}
