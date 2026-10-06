import type { RequestHandler } from "express";
import { logger } from "../lib/logger.js";

export const requestLog: RequestHandler = (req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    logger.info(
      { method: req.method, path: req.path, status: res.statusCode, ms: Date.now() - startedAt },
      "request",
    );
  });
  next();
};
