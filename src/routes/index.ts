import { Router } from "express";
import dummyRoutes from "./dummy.routes.js";

const router = Router();

// Mount routes
router.use("/dummy", dummyRoutes);

export default router;
