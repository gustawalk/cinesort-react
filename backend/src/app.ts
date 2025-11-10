import express, { Express } from "express";
import userRoutes from "@/routes/user.routes";
import authRoutes from "@/routes/auth.routes";
import cors from "cors";

const app: Express = express();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: false
}))
app.use("/api", authRoutes);
app.use("/api", userRoutes);

export default app;
