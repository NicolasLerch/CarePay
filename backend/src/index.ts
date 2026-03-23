import { env } from "./config/env.js";
import { getDbClient } from "./db/client.js";

function bootstrap(): void {
  getDbClient();
  console.log(`Backend base ready. Database URL configured: ${env.tursoDatabaseUrl}`);
}

bootstrap();
