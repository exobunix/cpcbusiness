import { createServer } from "http";
import app from "./app";
import { logger } from "./lib/logger";
import { connectMongoDB } from "@workspace/db/mongodb";
import { initSocketIO } from "./lib/socket";

const rawPort = process.env["PORT"] || "5000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = createServer(app);

// Initialize Socket.IO real-time chat server
initSocketIO(server);

// Connect to MongoDB Atlas
connectMongoDB()
  .then(() => {
    logger.info("Connected to MongoDB Atlas cluster cpcbusiness");
  })
  .catch((err) => {
    logger.warn({ err }, "MongoDB Atlas initial connection notice (will retry on demand)");
  });

server.listen(port, () => {
  logger.info({ port }, "Server & Socket.IO listening");
});
