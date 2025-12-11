import { pool } from "@/config/db";
import { Movie } from "@/models/movie.model";
import { RowDataPacket } from "mysql2";

type setMovieRateResult = | { status: "ok" }

export const setMovieRate = async (user_id: number, movie: Movie, score_movie: string): Promise<setMovieRateResult> => {

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM watched_movies WHERE id_user = ? AND id_movie = ?", [user_id, movie.imdb_id]
  );

  if (rows.length == 0) {
    // add that movie entry
    await pool.query<RowDataPacket[]>(
      "INSERT INTO watched_movies (id_user, name_movie, score_movie, id_movie) VALUES (?, ?, ?, ?)",
      [user_id, movie.titulo, score_movie, movie.imdb_id]
    )
  } else {
    // user have already watched this movie
    await pool.query<RowDataPacket[]>(
      "UPDATE watched_movies SET times_watched = times_watched + 1, watched_at = NOW(), score_movie = ? WHERE id_user = ? AND id_movie = ?",
      [score_movie, user_id, movie.imdb_id]
    )
  }

  // cleaning user's pendency
  await pool.query<RowDataPacket[]>(
    "DELETE FROM pendencias WHERE id_user_pendente = ? AND filme_id_imdb = ?", [user_id, movie.imdb_id]
  )

  return { status: "ok" }
}
