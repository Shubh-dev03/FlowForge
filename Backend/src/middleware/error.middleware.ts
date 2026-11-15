import type { ErrorRequestHandler } from "express";
import logger from "../config/logger";
import { AppError } from "../utils/appError";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  logger.error({ err }, "Unhandled Application Error");

  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
};
