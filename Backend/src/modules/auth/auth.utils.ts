import argon2 from "argon2";
import logger from "../../config/logger";
import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";

// Password Hashing
export const hashPassword = async (password: string) => {
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
    });
    return hash;
  } catch (error) {
    logger.error({ err: error }, "Password hashing failed");
    throw error;
  }
};

// Password Verification
export const verifyPassword = async (
  storedPassword: string,
  password: string,
) => {
  try {
    const isPasswordValid = await argon2.verify(storedPassword, password);
    return isPasswordValid;
  } catch (error) {
    logger.error({ err: error }, "Password verification failed");
    throw error;
  }
};

// JWT Token Generation
export const generateAccessToken = (userId: string) => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }

  return jwt.sign({}, secret, {
    subject: userId,
    expiresIn: "15m",
    algorithm: "HS256",
  });
};

// Generation of Refresh Token
export const generateRefreshToken = () => {
  return randomBytes(64).toString("hex");
};

// Hashing Refresh Token
export const hashRefreshToken = (token: string) => {
  return createHash("sha256").update(token).digest("hex");
};

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
