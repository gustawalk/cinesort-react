import { healthCheck } from "@/controllers/healthcheck.controller";
import { Router } from "express";

const router: Router = Router();

router.get("/health", healthCheck);

export default router;
