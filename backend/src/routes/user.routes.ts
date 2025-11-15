import { authMiddleware } from "@/middlewares/auth.middleware";
import { Router } from "express";
import { userStats } from "@/controllers/user.controller";

const router: Router = Router();

router.get("/userStats", authMiddleware, userStats);

export default router;

