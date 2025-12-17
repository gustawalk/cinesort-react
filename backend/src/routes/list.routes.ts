import {
  userLists,
  createList,
  deleteList,
  drawList,
  movieAddList,
  editList,
  movieDeleteList,
  popularList,
  popularListDetail,
  importMovieList
} from "@/controllers/list.controller";
import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middleware";

const router: Router = Router();

router.get("/list", authMiddleware, userLists);
router.post("/list", authMiddleware, createList);
router.delete("/list", authMiddleware, deleteList);
router.post("/list/:id/draw", authMiddleware, drawList);
router.post("/list/movie/add", authMiddleware, movieAddList)
router.get("/list/:id/edit", authMiddleware, editList);
router.delete("/list/movie/delete", authMiddleware, movieDeleteList);
router.get("/list/popular", authMiddleware, popularList);
router.get("/list/popular/:id", authMiddleware, popularListDetail);
router.post("/list/import", authMiddleware, importMovieList);

export default router;
