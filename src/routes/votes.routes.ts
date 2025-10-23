import { Router } from "express";
import { addVoteController, removeVoteController, getVotesController } from "../controllers/votes.controller.js";

const router = Router();

// POST /api/v1/deals/:id/vote
router.post("/:id/vote", addVoteController);

// DELETE /api/v1/deals/:id/vote
router.delete("/:id/vote", removeVoteController);

// GET /api/v1/deals/:id/votes
router.get("/:id/votes", getVotesController);

export default router;
