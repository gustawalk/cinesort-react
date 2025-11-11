import { Request, Response } from "express";
import { getUserLists } from "@/services/list.service";

export const userLists = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(500).json({ message: "User data missing from request" });
  }

  const result = await getUserLists({ id: user.id } as any);

  if (result.status === "ok") {
    return res.status(200).json({ user_lists: result.user_lists });
  }

  if (result.status === "no_content") {
    return res.status(200).json(result);
  }

  return res.status(400).json({ message: "User list not found" });
};
