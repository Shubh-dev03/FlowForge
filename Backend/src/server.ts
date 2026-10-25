import app from "./app";
import "dotenv/config";
import logger from "./config/logger";
import { checkDatabaseConnection } from "./db/check";

const port = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await checkDatabaseConnection();
    app.listen(port, () => {
      logger.info({ port }, "FlowForge API Started");
    });
  } catch (error) {
    logger.error({ err: error }, "FlowForge startup Failed.");
    process.exit(1);
  }
};

startServer();
