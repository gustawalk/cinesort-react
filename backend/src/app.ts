import express, { Express } from "express";
import userRoutes from "@/routes/user.routes";
import authRoutes from "@/routes/auth.routes";
import listRoutes from "@/routes/list.routes";
import movieRoutes from "@/routes/movie.routes";
import healthRoutes from "@/routes/healthcheck.routes"
import cors from "cors";

const app: Express = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://cinesort.gwalk.dev",
  "https://api.cinesort.gwalk.dev"
];

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", listRoutes);
app.use("/api", movieRoutes);
app.use("/api", healthRoutes);

export default app;
