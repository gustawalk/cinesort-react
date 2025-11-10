import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface Payload {
  id: number;
  username: string;
}

export function generateToken(payload: Payload): string {
  const options: SignOptions = {
    expiresIn: "30d",
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): Payload {
  return jwt.verify(token, JWT_SECRET) as Payload;
}
