import { pgTable, uuid, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const refreshTokenFamilies = pgTable(
  "refresh_token_families",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    revokedAt: timestamp("revoked_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("refresh_token_families_user_id_idx").on(table.userId)],
);
