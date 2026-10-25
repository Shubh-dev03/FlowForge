import logger from "../config/logger";
import { db } from "./client";
import { sql } from "drizzle-orm";

export const checkDatabaseConnection = async () => {
  const connectionURL = process.env.DATABASE_URL;

  logger.info("Connecting to the database...");
  try {
    //Validation
    if (!connectionURL) {
      throw new Error("Connection_URL is missing");
    }
    const result = await db.execute(sql`SELECT 1 as connection_test`);
    logger.info("Database connection successful!");
    logger.info({ rows: result.rows }, "Test query result");
  } catch (error) {
    logger.error({ err: error }, `Database connection Failed!!`);
    throw error;
  }
};
