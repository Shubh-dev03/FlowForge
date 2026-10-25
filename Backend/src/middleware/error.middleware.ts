import type { ErrorRequestHandler } from "express";
import logger from "../config/logger";
import { success } from "zod";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  logger.error({ err }, "Unhandled Application Error");

  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
};
