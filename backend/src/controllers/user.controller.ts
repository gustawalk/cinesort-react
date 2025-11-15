import { getUserStats } from "@/services/user.service";
import { Request, Response } from "express";

export const userStats = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(500).json({ message: "User data missing from request" });
  }

  const userStatsResult = await getUserStats(user);

  return res.status(200).json(userStatsResult);
}
