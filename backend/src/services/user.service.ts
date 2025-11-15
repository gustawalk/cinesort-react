import { UserStats } from "@/models/userstats.model"
import { pool } from "@/config/db";
import { RequestUser } from "@/types/express";
import { RowDataPacket } from "mysql2";

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

  console.log("--------------------------------")
  console.log(highestRatedRows)
  console.log(lowestRatedRows)
  console.log(lastMovieRows)
  console.log("--------------------------------")

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
