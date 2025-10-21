import { Router } from "express";
import { addCommentController, getCommentsController, deleteCommentController } from "../controllers/comments.controller.js";

const router = Router();

// POST /api/v1/deals/:id/comments
router.post("/deals/:id/comments", addCommentController);

// GET /api/v1/deals/:id/comments
router.get("/deals/:id/comments", getCommentsController);

// DELETE /api/v1/comments/:id
router.delete("/comments/:id", deleteCommentController);

export default router;
