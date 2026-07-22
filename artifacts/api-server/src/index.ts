import app from "./app";
import { logger } from "./lib/logger";
import { connectMongoDB } from "@workspace/db/mongodb";

const rawPort = process.env["PORT"] || "5000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Connect to MongoDB Atlas
connectMongoDB()
  .then(() => {
    logger.info("Connected to MongoDB Atlas cluster cpcbusiness");
  })
  .catch((err) => {
    logger.warn({ err }, "MongoDB Atlas initial connection notice (will retry on demand)");
  });

app.listen(port, (err?: any) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

