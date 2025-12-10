import { getUserStats, checkUserPendency } from "@/services/user.service";
import { Request, Response } from "express";

export const userStats = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(500).json({ message: "User data missing from request" });
  }

  const userStatsResult = await getUserStats(user);

  return res.status(200).json(userStatsResult);
}

type PendencyStatus = "true" | "false"

export const userPendency = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(500).json({ message: "User data missing from request" });
  }

  const userPendencyResult = await checkUserPendency(user.id);

  const responsesMap: Record<PendencyStatus, () => Response> = {
    true: () => res.status(409).json({ message: "Pendency found", movie: userPendencyResult.movie }),
    false: () => res.status(200).json({ message: "No pendency", movie: null })
  }

  if (responsesMap[userPendencyResult.result]) {
    return responsesMap[userPendencyResult.result]();
  }

  return res.status(500).json({ message: "Something went wrong" });
}
