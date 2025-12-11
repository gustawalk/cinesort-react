import { authMiddleware } from "@/middlewares/auth.middleware";
import { Router } from "express";
import { rateMovie } from "@/controllers/movie.controller";

const router: Router = Router();

router.post("/movie/rate", authMiddleware, rateMovie)

export default router;

