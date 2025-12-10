import { User } from "@/models/user.model";
import { pool } from "@/config/db";
import { compareHashPassword, hashPassword } from "@/utils/password";
import { validateEmail } from "@/utils/email";

type LoginResult = | { status: "ok", user: User } | { status: "notfound" } | { status: "error", message: string, code?: number }

export const loginUser = async (username: string, password: string): Promise<LoginResult> => {
  try {
    let [rows] = await pool.query("SELECT * FROM usuarios WHERE nome_user = ?", [username]);

    if ((rows as any[]).length <= 0) {
      return { status: "notfound" }
    }

    const user = (rows as any[])[0];
    const password_check = await compareHashPassword(password, user.senha_user);

    if (!password_check) {
      return { status: "notfound" }
    }

    return {
      status: "ok",
      user: user
    };
  }
  catch (err: any) {
    return {
      status: "error",
      message: err.message
    };
  }
};

type RegisterResult = | { status: "ok", user: User } | { status: "exists" } | { status: "error", message: string, code?: number }

export const registerUser = async (username: string, email: string, password: string): Promise<RegisterResult> => {
  console.log(username, email, password);

  if (!validateEmail(email)) {
    return {
      status: "error",
      message: "This email is not valid",
      code: 400
    };
  }

  let [rows] = await pool.query("SELECT * FROM usuarios WHERE nome_user = ? OR email_user = ?", [username, email])

  if ((rows as any[]).length != 0) {
    return { status: "exists" };
  }

  const hashed_password = await hashPassword(password)

  try {
    let [result] = await pool.query(
      'INSERT INTO usuarios (nome_user, email_user, senha_user) VALUES (?, ?, ?)', [username, email, hashed_password]
    )

    const insertId = (result as any).insertId;

    const newUser: User = {
      id: insertId,
      nome_user: username,
      email_user: email,
    }

    return { status: "ok", user: newUser };
  } catch (err: any) {
    return { status: "error", message: err.message }
  }
}
