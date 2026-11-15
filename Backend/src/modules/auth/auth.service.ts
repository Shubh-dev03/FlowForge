import { db } from "../../db/client";
import { users } from "../../db/schema/users";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth.utils";
import type { RegisterInput } from "./auth.schema";
import { AppError } from "../../utils/appError";

export const registerUser = async (input: RegisterInput) => {
  const email = input.email.trim().toLowerCase();

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existingUser) {
    throw new AppError(409, "Email already registered");
  }

  const passwordHash = await hashPassword(input.password);

  try {
    const [newUser] = await db
      .insert(users)
      .values({
        name: input.name.trim(),
        email,
        passwordHash,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      });
    return newUser;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "23505") {
      throw new AppError(409, "Email already registered");
    }

    throw error;
  }
};
