import { UserStats } from "@/models/userstats.model"
import { pool } from "@/config/db";
import { RequestUser } from "@/types/express";
import { RowDataPacket } from "mysql2";
import { Movie } from "@/models/movie.model";
import { Pendency } from "@/models/pendency.model";
import { UserRate } from "@/models/userrate.model";

type UserStatsResult = { status: "ok", user_stats: UserStats }

interface CountResult extends RowDataPacket {
  count: number
}

interface MovieResult extends RowDataPacket {
  name_movie: string;
  id_movie: string;
}

export const getUserStats = async (user: RequestUser): Promise<UserStatsResult> => {

  const [countRows] = await pool.query<CountResult[]>(
    'SELECT COUNT(*) as count FROM watched_movies WHERE Id_user = ?',
    [user.id]
  );

  const [highestRatedRows] = await pool.query<MovieResult[]>(
    `
      SELECT name_movie, id_movie
      FROM watched_movies
      WHERE id_user = ?
      ORDER BY score_movie DESC, watched_at DESC
      LIMIT 1
    `, [user.id]
  );

  const [lowestRatedRows] = await pool.query<MovieResult[]>(
    `
      SELECT name_movie, id_movie
      FROM watched_movies
      WHERE id_user = ?
      ORDER BY score_movie ASC, watched_at DESC
      LIMIT 1
    `, [user.id]
  );

  const [lastMovieRows] = await pool.query<MovieResult[]>(
    `
      SELECT name_movie, id_movie
      FROM watched_movies
      WHERE id_user = ?
      ORDER BY watched_at DESC
      LIMIT 1
    `, [user.id]
  );

  return {
    status: "ok",
    user_stats: {
      lastMovie: lastMovieRows[0] ? {
        name_movie: lastMovieRows[0].name_movie,
        id_movie: lastMovieRows[0].id_movie,
      } : {
        name_movie: "None",
        id_movie: ""
      },
      watchedMovies: countRows[0]?.count ?? 0,
      highestRated: highestRatedRows[0] ? {
        name_movie: highestRatedRows[0].name_movie,
        id_movie: highestRatedRows[0].id_movie
      } : {
        name_movie: "None",
        id_movie: "",
      },
      lowestRated: lowestRatedRows[0] ? {
        name_movie: lowestRatedRows[0].name_movie,
        id_movie: lowestRatedRows[0].id_movie
      } : {
        name_movie: "None",
        id_movie: "",
      }
    }
  };
}

type UserPendencyResult = | { status: "ok", result: "true", movie: Movie } | { status: "ok", result: "false", movie: null }

export const checkUserPendency = async (user_id: number): Promise<UserPendencyResult> => {

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM pendencias WHERE id_user_pendente = ?", [user_id]
  )

  if (rows.length === 0) {
    return { status: "ok", result: "false", movie: null }
  }

  const pendency = rows[0] as Pendency;
  const movie_id = pendency.filme_id_imdb;

  const [movieRows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM filmes WHERE imdb_id = ?", [movie_id]
  )

  const movie = movieRows[0] as Movie;

  return { status: "ok", result: "true", movie: movie }
}

type RateByIdResult = | { status: "ok", rate: string } | { status: "no_content", rate: null }

export const getRateByMovieId = async (movie_id: string, user_id: number): Promise<RateByIdResult> => {

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM watched_movies WHERE id_movie = ? AND id_user = ?", [movie_id, user_id]
  )

  if (rows.length === 0) {
    return { status: "no_content", rate: null }
  }

  const data = rows[0] as UserRate

  return { status: "ok", rate: data.score_movie }
}
