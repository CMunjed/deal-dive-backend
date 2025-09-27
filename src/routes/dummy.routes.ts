import { Router } from 'express';
import { getDummyHandler } from '../controllers/dummy.controller.js';

const router = Router();

// GET /api/v1/dummy
router.get("/", getDummyHandler);

export default router;
