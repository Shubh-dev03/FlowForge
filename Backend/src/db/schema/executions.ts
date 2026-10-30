import { pgTable, uuid, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { workflows } from "./workflows";

export const executionStatus = pgEnum("execution_status", [
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled",
]);

export const executions = pgTable("executions", {
  id: uuid("id").defaultRandom().primaryKey(),

  workflowId: uuid("workflow_id").references(() => workflows.id, {
    onDelete: "set null",
  }),

  status: executionStatus("status").notNull(),

  definitionSnapshot: jsonb("definition_snapshot").notNull(),

  startedAt: timestamp("started_at", { withTimezone: true }),

  finishedAt: timestamp("finished_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
