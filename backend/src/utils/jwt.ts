import { RequestUser } from "@/types/express";
import jwt, { SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export function generateToken(payload: RequestUser): string {
  const options: SignOptions = {
    expiresIn: "30d",
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): RequestUser {
  return jwt.verify(token, JWT_SECRET) as RequestUser;
}
