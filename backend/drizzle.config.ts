import "dotenv/config";

import { defineConfig } from "drizzle-kit";

const url = process.env.TURSO_DATABASE_URL;

if (!url) {
  throw new Error("Missing required environment variable: TURSO_DATABASE_URL");
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
  strict: true,
  verbose: true,
});
