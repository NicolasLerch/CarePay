import { createServer } from "./app/server.js";
import { env } from "./config/env.js";
import { getDbClient } from "./db/client.js";

async function bootstrap(): Promise<void> {
  getDbClient();

  const app = createServer();

  app.listen(env.port, () => {
    console.log(`Backend listening on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Error starting backend.", error);
  process.exit(1);
});
