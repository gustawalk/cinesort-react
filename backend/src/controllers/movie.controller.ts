import { Request, Response } from "express";
import { setMovieRate } from "@/services/movie.service";

type RateStatus = | "ok"

export const rateMovie = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(500).json({ message: "User data missing from request" });
  }

  const result = await setMovieRate(user.id, req.body.movie, req.body.rate)

  const responsesMap: Record<RateStatus, () => Response> = {
    ok: () => res.status(200).json({ message: "Rate set successfully" }),
  };

  if (responsesMap[result.status]) {
    return responsesMap[result.status]();
  }

  return res.status(500).json({ message: "User data missing from request" });
}
