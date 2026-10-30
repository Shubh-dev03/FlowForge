import {
  uuid,
  pgTable,
  pgEnum,
  integer,
  varchar,
  timestamp,
  jsonb,
  text,
} from "drizzle-orm/pg-core";

import { executions } from "./executions";

export const executionStepStatus = pgEnum("execution_step_status", [
  "pending",
  "running",
  "completed",
  "failed",
  "skipped",
]);

export const executionSteps = pgTable("execution_steps", {
  id: uuid("id").defaultRandom().primaryKey(),
  executionId: uuid("execution_id")
    .references(() => executions.id, {
      onDelete: "cascade",
    })
    .notNull(),
  stepIndex: integer("step_index").notNull(),

  stepKey: varchar("step_key", { length: 100 }).notNull(),

  status: executionStepStatus("status").default("pending").notNull(),

  startedAt: timestamp("started_at", { withTimezone: true }),

  finishedAt: timestamp("finished_at", { withTimezone: true }),

  output: jsonb("output"),

  error: text("error"),
});
