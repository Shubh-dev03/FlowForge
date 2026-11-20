import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError";

export const authenticate: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, "Authentication required"));
  }

  const token = authHeader.split(" ")[1];

  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    return next(new Error("JWT_ACCESS_SECRET is not configured"));
  }

  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });

    if (typeof decoded === "string" || typeof decoded.sub !== "string") {
      return next(new AppError(401, "Invalid access token"));
    }

    res.locals.userId = decoded.sub;

    return next();
  } catch {
    return next(new AppError(401, "Invalid or expired access token"));
  }
};
