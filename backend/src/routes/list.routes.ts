// TODO: here i will make the lists routes, like create, delete, edit the movies in it
import { userLists } from "@/controllers/list.controller";
import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middleware";

const router: Router = Router();

router.get("/userLists", authMiddleware, userLists);

export default router;
