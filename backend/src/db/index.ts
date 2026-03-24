import { drizzle } from "drizzle-orm/libsql";

import { getDbClient } from "./client.js";

export const db = drizzle(getDbClient());

