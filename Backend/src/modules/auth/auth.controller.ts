import type { RequestHandler } from "express";
import { registerSchema, loginSchema } from "./auth.schema";
import {
  registerUser,
  createRefreshTokenRecord,
  loginUser,
} from "./auth.service";
import { AppError } from "../../utils/appError";
import { generateAccessToken, refreshTokenCookieOptions } from "./auth.utils";

// User Registration Controller
export const register: RequestHandler = async (req, res, next) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError(400, "Invalid registration details");
    }
    const newUser = await registerUser(result.data);

    return res.status(201).json({
      message: "User Registered Successfully",
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

//User Login Controller
export const login: RequestHandler = async (req, res, next) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError(400, "Invalid login details");
    }

    const user = await loginUser(result.data);

    const accessToken = generateAccessToken(user.id);
    const refreshTokenData = await createRefreshTokenRecord(user.id);

    res.cookie(
      "refreshToken",
      refreshTokenData.refreshToken,
      refreshTokenCookieOptions,
    );

    return res.status(200).json({
      message: "Login successful",
      user,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};
