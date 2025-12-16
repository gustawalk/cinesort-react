import { authMiddleware } from "@/middlewares/auth.middleware";
import { Router } from "express";
import { userStats, userPendency, userRate } from "@/controllers/user.controller";

const router: Router = Router();

router.get("/user/stats", authMiddleware, userStats);
router.get("/user/rate/:movieid", authMiddleware, userRate)
router.get("/user/pendency", authMiddleware, userPendency);

export default router;

