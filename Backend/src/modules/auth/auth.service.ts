import { db } from "../../db/client";
import { users } from "../../db/schema/users";
import { refreshTokens } from "../../db/schema/refresh-tokens";
import { refreshTokenFamilies } from "../../db/schema/refresh-token-families";

import { eq, and, isNull } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import {
  hashPassword,
  verifyPassword,
  generateRefreshToken,
  hashRefreshToken,
} from "./auth.utils";

import type { RegisterInput, LoginInput } from "./auth.schema";
import { AppError } from "../../utils/appError";

// USER REGISTRATION

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

// USER LOGIN

export const loginUser = async (input: LoginInput) => {
  const email = input.email.trim().toLowerCase();

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isPasswordValid = await verifyPassword(
    user.passwordHash,
    input.password,
  );

  if (!isPasswordValid) {
    throw new AppError(401, "Invalid email or password");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};

// CREATE INITIAL REFRESH TOKEN AND FAMILY

export const createRefreshTokenRecord = async (userId: string) => {
  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);
  const familyId = randomUUID();

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const result = await db.transaction(async (tx) => {
    await tx.insert(refreshTokenFamilies).values({
      id: familyId,
      userId,
    });

    const [record] = await tx
      .insert(refreshTokens)
      .values({
        userId,
        familyId,
        tokenHash,
        expiresAt,
      })
      .returning({
        id: refreshTokens.id,
      });

    return record;
  });

  return {
    refreshToken,
    refreshTokenId: result.id,
    familyId,
    expiresAt,
  };
};

// FIND REFRESH TOKEN RECORD

export const findRefreshTokenRecord = async (token: string) => {
  const tokenHash = hashRefreshToken(token);

  const [record] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, tokenHash))
    .limit(1);

  return record ?? null;
};

// VALIDATE REFRESH TOKEN

export const validateRefreshToken = async (token: string) => {
  const record = await findRefreshTokenRecord(token);

  if (!record) {
    throw new AppError(401, "Invalid refresh token");
  }

  const [family] = await db
    .select({
      id: refreshTokenFamilies.id,
      userId: refreshTokenFamilies.userId,
      revokedAt: refreshTokenFamilies.revokedAt,
    })
    .from(refreshTokenFamilies)
    .where(eq(refreshTokenFamilies.id, record.familyId))
    .limit(1);

  if (!family || family.revokedAt !== null || family.userId !== record.userId) {
    throw new AppError(401, "Invalid refresh token family");
  }

  if (record.revokedAt !== null) {
    throw new AppError(401, "Refresh token revoked");
  }

  if (record.expiresAt <= new Date()) {
    throw new AppError(401, "Refresh token expired");
  }

  return record;
};

// REVOKE REFRESH TOKEN FAMILY

export const revokeTokenFamily = async (familyId: string) => {
  return db.transaction(async (tx) => {
    // Lock the family first.
    const [family] = await tx
      .select({ id: refreshTokenFamilies.id })
      .from(refreshTokenFamilies)
      .where(eq(refreshTokenFamilies.id, familyId))
      .for("update")
      .limit(1);

    if (!family) {
      return;
    }

    const now = new Date();

    await tx
      .update(refreshTokenFamilies)
      .set({ revokedAt: now })
      .where(
        and(
          eq(refreshTokenFamilies.id, familyId),
          isNull(refreshTokenFamilies.revokedAt),
        ),
      );

    await tx
      .update(refreshTokens)
      .set({ revokedAt: now })
      .where(
        and(
          eq(refreshTokens.familyId, familyId),
          isNull(refreshTokens.revokedAt),
        ),
      );
  });
};

// ROTATE REFRESH TOKEN

export const rotateRefreshToken = async (token: string) => {
  const tokenHash = hashRefreshToken(token);

  const result = await db.transaction(async (tx) => {
    // 1. Find the token to identify its family.
    const [initialRecord] = await tx
      .select({
        id: refreshTokens.id,
        familyId: refreshTokens.familyId,
      })
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1);

    if (!initialRecord) {
      throw new AppError(401, "Invalid refresh token");
    }

    // 2. Lock the family. All rotations and family
    // revocations must acquire this lock first.
    const [family] = await tx
      .select()
      .from(refreshTokenFamilies)
      .where(eq(refreshTokenFamilies.id, initialRecord.familyId))
      .for("update")
      .limit(1);

    if (!family) {
      throw new AppError(401, "Invalid refresh token family");
    }

    if (family.revokedAt !== null) {
      throw new AppError(401, "Refresh token family revoked");
    }

    // 3. Re-read and lock the token after acquiring
    // the family lock. Its state may have changed
    // while this transaction was waiting.
    const [oldRecord] = await tx
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.id, initialRecord.id),
          eq(refreshTokens.familyId, family.id),
        ),
      )
      .for("update")
      .limit(1);

    if (!oldRecord) {
      throw new AppError(401, "Invalid refresh token");
    }

    if (family.userId !== oldRecord.userId) {
      throw new AppError(401, "Invalid refresh token family");
    }

    // 4. Detect reuse before checking expiry.
    if (oldRecord.revokedAt !== null) {
      const now = new Date();

      await tx
        .update(refreshTokenFamilies)
        .set({ revokedAt: now })
        .where(
          and(
            eq(refreshTokenFamilies.id, family.id),
            isNull(refreshTokenFamilies.revokedAt),
          ),
        );

      await tx
        .update(refreshTokens)
        .set({ revokedAt: now })
        .where(
          and(
            eq(refreshTokens.familyId, family.id),
            isNull(refreshTokens.revokedAt),
          ),
        );

      return {
        status: "reuse_detected" as const,
      };
    }

    // 5. Reject expired tokens.
    if (oldRecord.expiresAt <= new Date()) {
      throw new AppError(401, "Refresh token expired");
    }

    // 6. Revoke the old token.
    const now = new Date();

    const [revokedRecord] = await tx
      .update(refreshTokens)
      .set({ revokedAt: now })
      .where(
        and(
          eq(refreshTokens.id, oldRecord.id),
          isNull(refreshTokens.revokedAt),
        ),
      )
      .returning({
        id: refreshTokens.id,
      });

    if (!revokedRecord) {
      throw new AppError(401, "Refresh token is no longer valid");
    }

    // 7. Generate and hash the replacement token.
    const newRefreshToken = generateRefreshToken();
    const newTokenHash = hashRefreshToken(newRefreshToken);

    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // 8. Store the replacement in the same family.
    const [newRecord] = await tx
      .insert(refreshTokens)
      .values({
        userId: oldRecord.userId,
        familyId: oldRecord.familyId,
        tokenHash: newTokenHash,
        expiresAt: newExpiresAt,
      })
      .returning({
        id: refreshTokens.id,
      });

    // 9. Connect the old token to its replacement.
    await tx
      .update(refreshTokens)
      .set({
        replacedByTokenId: newRecord.id,
      })
      .where(eq(refreshTokens.id, oldRecord.id));

    return {
      status: "rotated" as const,
      refreshToken: newRefreshToken,
      userId: oldRecord.userId,
      expiresAt: newExpiresAt,
    };
  });

  // 10. Reuse detection must be thrown AFTER the
  // transaction commits, so family revocation persists.
  if (result.status === "reuse_detected") {
    throw new AppError(401, "Refresh token reuse detected");
  }

  return result;
};
