import { authMiddleware } from "@/middlewares/auth.middleware";
import { Router } from "express";
import { rateMovie, getMovieInfo, getMovieSearch } from "@/controllers/movie.controller";

const router: Router = Router();

router.post("/movie/rate", authMiddleware, rateMovie)
router.get("/movie/info/:id", authMiddleware, getMovieInfo)
router.get("/movie/search/:movie", authMiddleware, getMovieSearch)

export default router;

