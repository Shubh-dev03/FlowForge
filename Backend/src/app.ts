import express from "express";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";
import logger from "./config/logger";
import healthRoutes from "./modules/health/health.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(errorHandler);
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(pinoHttp({ logger }));

app.use("/api/health", healthRoutes);

export default app;
