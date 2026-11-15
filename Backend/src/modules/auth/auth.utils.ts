import argon2 from "argon2";
import logger from "../../config/logger";

export const hashPassword = async (password: string) => {
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
    });
    return hash;
  } catch (error) {
    throw new Error("password hashing failed");
  }
};

export const verifyPassword = async (
  storedPassword: string,
  password: string,
) => {
  try {
    const verifyPassword = await argon2.verify(storedPassword, password);
    return verifyPassword;
  } catch (error) {
    logger.error({ err: error }, "Password verification failed");
    throw error;
  }
};
