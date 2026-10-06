import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { requestLog } from "./middleware/requestLog.js";
import { routes } from "./routes.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestLog);

  app.use(routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
