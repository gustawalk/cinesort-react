import { List } from "@/models/list.model"
import { pool } from "@/config/db";
import { randomUUID } from "crypto";

type ListResult = | { status: "ok", user_lists: List[] } | { status: "no_content", user_lists: any[] }
type CreateResult = | { status: "created" } | { status: "conflict" }
type DeleteResult = | { status: "deleted" }
interface UserIdOnly {
  id: number
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
    await pool.query(
      "DELETE FROM listas WHERE id = ? AND id_user_dono = ?", [list_id, user_id]
    )

    return { status: "deleted" }
  } catch (err) {
    throw err;
  }
}
