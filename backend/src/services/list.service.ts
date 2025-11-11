import { User } from "@/models/user.model"
import { List } from "@/models/list.model"
import { pool } from "@/config/db";

type ListResult = | { status: "ok", user_lists: List[] } | { status: "no_content", user_lists: any[] }

export const getUserLists = async (user: User): Promise<ListResult> => {

  const [rows] = await pool.query(
    "SELECT * FROM listas WHERE id_user_dono = ?", [user.id]
  );

  if ((rows as any[]).length == 0) {
    return { status: "no_content", user_lists: [] }
  }

  const userLists = ((rows) as List[])

  return { status: "ok", user_lists: userLists };
}
