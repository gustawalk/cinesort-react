import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/utils/jwt";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "No token found" });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded;
    next();
  } catch {
    res.status(403).json({ error: "Invalid or expired token" });
    return;
  }
}
