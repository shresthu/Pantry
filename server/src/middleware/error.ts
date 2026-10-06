import type { ErrorRequestHandler, RequestHandler } from "express";
import { logger } from "../lib/logger.js";

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}`, code: "NOT_FOUND" });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  logger.error({ err }, "unhandled error");
  res.status(500).json({ error: "Something went wrong", code: "INTERNAL" });
};
