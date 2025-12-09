// TODO: here i will make the lists routes, like create, delete, edit the movies in it
import { userLists, createList, deleteList } from "@/controllers/list.controller";
import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middleware";

const router: Router = Router();

router.get("/list", authMiddleware, userLists);
router.post("/list", authMiddleware, createList);
router.delete("/list", authMiddleware, deleteList);

export default router;
