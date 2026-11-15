import type { RequestHandler } from "express";
import { registerSchema } from "./auth.schema";
import { registerUser } from "./auth.service";
import { AppError } from "../../utils/appError";

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
