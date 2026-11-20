import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core";

import { users } from "./users";
import { refreshTokenFamilies } from "./refresh-token-families";

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    familyId: uuid("family_id")
      .notNull()
      .references(() => refreshTokenFamilies.id, { onDelete: "cascade" }),

    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

    revokedAt: timestamp("revoked_at", { withTimezone: true }),

    replacedByTokenId: uuid("replaced_by_token_id"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("refresh_tokens_user_id_idx").on(table.userId),
    index("refresh_tokens_family_id_idx").on(table.familyId),
  ],
);
