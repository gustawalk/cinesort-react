import express, { Express } from "express";
import userRoutes from "@/routes/user.routes";
import authRoutes from "@/routes/auth.routes";
import listRoutes from "@/routes/list.routes";
import cors from "cors";

const app: Express = express();

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: false
}))
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", listRoutes);

export default app;
