import { authMiddleware } from "@/middlewares/auth.middleware";
import { Router } from "express";
import { rateMovie, getMovieInfo, getMovieSearch, getRandomMovie } from "@/controllers/movie.controller";

const router: Router = Router();

router.post("/movie/rate", authMiddleware, rateMovie)
router.get("/movie/info/:id", authMiddleware, getMovieInfo)
router.get("/movie/search/:movie", authMiddleware, getMovieSearch)
router.get("/movie/random", authMiddleware, getRandomMovie)

export default router;

