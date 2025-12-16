import { Request, Response } from "express";
import { setMovieRate, getInfoById, searchMovie, randomMovie } from "@/services/movie.service";

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

export const getMovieInfo = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(500).json({ message: "User data missing from request" });
  }

  const data = req.params.id

  const response = await getInfoById(String(data));

  return res.status(200).json({ movie: response });
}

export const getMovieSearch = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(500).json({ message: "User data missing from request" });
  }

  const data = req.params.movie

  const response = await searchMovie(String(data))

  return res.status(200).json({ result: response });
}

type RandomStatus = "ok" | "pendency"

export const getRandomMovie = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(500).json({ message: "User data missing from request" });
  }

  const response = await randomMovie(user.id);

  const responsesMap: Record<RandomStatus, () => Response> = {
    ok: () => res.status(200).json({ message: "ok", movie: response.movie }),
    pendency: () => res.status(409).json()
  }

  if (responsesMap[response.status]) {
    return responsesMap[response.status]();
  }

  return res.status(500).json({ message: "Something went wrong" });
}
