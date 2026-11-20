import express from "express";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";
import logger from "./config/logger";
import healthRoutes from "./modules/health/health.routes";
import authRoute from "./modules/auth/auth.routes";
import cookieParser from "cookie-parser";

import { errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(pinoHttp({ logger }));

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoute);

app.use(errorHandler);

export default app;
