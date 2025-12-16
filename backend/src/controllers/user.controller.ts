import { getUserStats, checkUserPendency, getRateByMovieId, getUserWatched } from "@/services/user.service";
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

type userRateStatus = "ok" | "no_content"

export const userRate = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(500).json({ message: "User data missing from request" });
  }

  const movie_id = req.params.movieid ?? ""

  const result = await getRateByMovieId(movie_id, user.id)

  const responsesMap: Record<userRateStatus, () => Response> = {
    ok: () => res.status(200).json({ message: "ok", rate: result.rate }),
    no_content: () => res.status(204).json({ message: "No content", rate: result.rate })
  }

  if (responsesMap[result.status]) {
    return responsesMap[result.status]();
  }

  return res.status(500).json({ message: "Something went wrong" });
}

type watchedResult = "ok" | "no_content"

export const userWatched = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(500).json({ message: "User data missing from request" });
  }

  const result = await getUserWatched(user.id);

  const responsesMap: Record<watchedResult, () => Response> = {
    ok: () => res.status(200).json({ message: "ok", watchedList: result.watchedList }),
    no_content: () => res.status(204).json({ message: "no content", watchedList: null })
  }

  if (responsesMap[result.status]) {
    return responsesMap[result.status]();
  }

  return res.status(500).json({ message: "Something went wrong" });
}
