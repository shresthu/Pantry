import { logger } from "../lib/logger.js";

logger.info("worker started; no jobs registered yet");

setInterval(() => {}, 1 << 30);

function shutdown(signal: string) {
  logger.info({ signal }, "worker stopping");
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
