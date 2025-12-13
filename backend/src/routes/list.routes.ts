import { userLists, createList, deleteList, drawList, movieAddList } from "@/controllers/list.controller";
import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middleware";

const router: Router = Router();

router.get("/list", authMiddleware, userLists);
router.post("/list", authMiddleware, createList);
router.delete("/list", authMiddleware, deleteList);
router.post("/list/:id/draw", authMiddleware, drawList);
router.post("/list/movie/add", authMiddleware, movieAddList)
// TODO: add later list/movie/remove

export default router;
