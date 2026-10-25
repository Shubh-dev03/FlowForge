import { pgTable, uuid, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";

export const workflows = pgTable("workflows", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: varchar("name", { length: 150 }).notNull(),

  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  description: varchar("description", { length: 255 }),

  definition: jsonb("definition").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
