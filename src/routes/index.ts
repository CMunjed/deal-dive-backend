import { Router } from "express";
import dummyRoutes from "./dummy.routes.js";
import dealsRoutes from "./deals.routes.js";

const router = Router();

// Mount routes
router.use("/dummy", dummyRoutes);
router.use("/deals", dealsRoutes);

export default router;
