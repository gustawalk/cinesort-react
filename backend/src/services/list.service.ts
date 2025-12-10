import { List } from "@/models/list.model"
import { Movie } from "@/models/movie.model";
import { pool } from "@/config/db";
import { randomUUID } from "crypto";
import { RowDataPacket } from "mysql2";

type ListResult = | { status: "ok", user_lists: List[] } | { status: "no_content", user_lists: any[] }
type CreateResult = | { status: "created" } | { status: "conflict" }
type DeleteResult = | { status: "deleted" }
type DrawResult = | { status: "ok", movie: Movie } | { status: "no_content", movie: null } | { status: "pendency", movie: null }

interface UserIdOnly {
  id: number
}

const checkUserPendency = async (user_id: number): Promise<boolean> => {

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM pendencias WHERE id_user_pendente = ?", [user_id]
  );

  if (rows.length != 0) {
    return true;
  }

  return false;
}

export const getUserLists = async (user: UserIdOnly): Promise<ListResult> => {

  const [rows] = await pool.query(
    "SELECT * FROM listas WHERE id_user_dono = ?", [user.id]
  );

  if ((rows as any[]).length == 0) {
    return { status: "no_content", user_lists: [] }
  }

  const userLists = ((rows) as List[])

  return { status: "ok", user_lists: userLists };
}

export const createNewList = async (user_id: number, newListName: string): Promise<CreateResult> => {
  try {
    const list_uuid = randomUUID();

    const [rows] = await pool.query(
      "SELECT id FROM listas WHERE id_user_dono = ? AND nome_lista = ?", [user_id, newListName]
    );

    if ((rows as any[]).length != 0) {
      return { status: "conflict" };
    }

    await pool.query(
      "INSERT INTO listas (id_user_dono, nome_lista, uuid) VALUES (?, ?, ?)", [user_id, newListName, list_uuid]
    )

    return { status: "created" }
  } catch (err) {
    throw err;
  }
}

export const deleteUserList = async (list_id: number, user_id: number): Promise<DeleteResult> => {
  console.log(user_id, list_id)
  try {

    // deleting all movies from that list
    await pool.query(
      `DELETE ml
       FROM movie_lists ml
       JOIN listas l ON ml.id_lista_origem = l.id
       WHERE l.id = ? AND l.id_user_dono = ?`,
      [list_id, user_id]
    );

    // deleting the list
    await pool.query(
      "DELETE FROM listas WHERE id = ? AND id_user_dono = ?",
      [list_id, user_id]
    );

    return { status: "deleted" }
  } catch (err) {
    throw err;
  }
}

export const drawFromList = async (list_id: number, user_id: number): Promise<DrawResult> => {
  try {
    // checking pendency first

    if (await checkUserPendency(user_id)) {
      return { status: "pendency", movie: null }
    }

    // drawing movie
    const [movieRows] = await pool.query<RowDataPacket[]>(
      "SELECT ml.movie_imdb_id FROM movie_lists AS ml JOIN listas l ON ml.id_lista_origem = l.id WHERE l.id_user_dono = ? AND ml.id_lista_origem = ? ORDER BY RAND() LIMIT 1",
      [user_id, list_id]
    );

    if (movieRows.length === 0) {
      return { status: "no_content", movie: null };
    }

    // get movie id
    const movie_id = (movieRows[0] as { movie_imdb_id: string }).movie_imdb_id;

    // get full movie info
    const [movieInfoRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM filmes WHERE imdb_id = ?", [movie_id]
    );

    if (movieInfoRows.length === 0) {
      return { status: "no_content", movie: null };
    }

    const movie = movieInfoRows[0] as Movie;

    // deleting from list
    await pool.query(
      "DELETE FROM movie_lists WHERE id_lista_origem = ? AND movie_imdb_id = ?",
      [list_id, movie_id]
    );

    // 4️⃣ TODO: adicionar pendency

    await pool.query(
      "INSERT INTO pendencias (id_user_pendente, id_lista_origem, filme_id_imdb) VALUES (?, ?, ?)", [user_id, list_id, movie_id]
    );

    return { status: "ok", movie };
  } catch (err) {
    throw err;
  }
}
