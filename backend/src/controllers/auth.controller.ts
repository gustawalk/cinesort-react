import { Request, Response } from "express";
import { loginUser, registerUser } from '@/services/auth.service';
import { generateToken } from "@/utils/jwt";

export const login: (req: Request, res: Response) => Promise<Response> = async (req, res) => {
  const { user, password } = req.body;

  if (!user || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const result = await loginUser(user, password);

  if (result.status == "notfound") {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  if (result.status == "error") {
    return res.status(result.code ?? 500).json({ message: result.message });
  }

  // generate jwt token
  const token = generateToken({
    id: result.user.id,
    username: result.user.nome_user,
  });


  return res.status(200).json({ message: "Login successful", user: result.user, token });
};

export const register: (req: Request, res: Response) => Promise<Response> = async (req, res) => {
  const { user, email, password } = req.body;

  if (!user || !email || !password) {
    return res.status(400).json({ message: "Username, email and password are required" });
  }

  const result = await registerUser(user, email, password);

  if (result.status === "exists") {
    return res
      .status(409)
      .json({ message: "There is already an account with this email or username" });
  }

  if (result.status === "error") {
    return res
      .status(result.code ?? 500)
      .json({ message: "Something went wrong", error: result.message });
  }

  const token = generateToken({
    id: result.user.id,
    username: result.user.nome_user
  })

  return res.status(201).json({
    message: "Register successful",
    user: result.user,
    token
  });
}
