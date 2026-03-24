import express from "express";

import { errorHandler } from "./middlewares/error-handler.js";
import { apiRouter } from "./routes/index.js";

export function createServer() {
  const app = express();

  app.use(express.json());
  app.use("/api/v1", apiRouter);
  app.use(errorHandler);

  return app;
}

