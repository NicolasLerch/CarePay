import { migrate } from "drizzle-orm/libsql/migrator";

import { db } from "./index.js";

async function main(): Promise<void> {
  await migrate(db, {
    migrationsFolder: "./src/db/migrations",
  });

  console.log("Migraciones aplicadas correctamente.");
}

main().catch((error) => {
  console.error("Error aplicando migraciones.", error);
  process.exit(1);
});
