import { createClient, type Client } from "@libsql/client";

import { env } from "../config/env.js";

let clientInstance: Client | null = null;

export function getDbClient(): Client {
  if (!clientInstance) {
    clientInstance = createClient({
      url: env.tursoDatabaseUrl,
      authToken: env.tursoAuthToken,
    });
  }

  return clientInstance;
}

