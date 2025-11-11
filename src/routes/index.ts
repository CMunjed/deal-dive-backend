import { Router } from "express";
import dummyRoutes from "./dummy.routes.js";
import dealsRoutes from "./deals.routes.js";
import savedDealsRoutes from "./saved-deals.routes.js";
import commentsRoutes from "./comments.routes.js";
import reportsRoutes from "./reports.routes.js";
import votesRoutes from "./votes.routes.js";

const router = Router();

// Mount routes
router.use("/dummy", dummyRoutes);
router.use("/deals", savedDealsRoutes);
router.use("/deals", dealsRoutes);
router.use("/", commentsRoutes);
router.use("/", reportsRoutes);
router.use("/deals", votesRoutes);

export default router;
