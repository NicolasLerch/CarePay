import { config } from "dotenv";

config();

function readEnv(name: string): string | undefined {
  const value = process.env[name];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function requireEnv(name: string): string {
  const value = readEnv(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  port: Number.parseInt(readEnv("PORT") ?? "3000", 10),
  tursoDatabaseUrl: requireEnv("TURSO_DATABASE_URL"),
  tursoAuthToken: readEnv("TURSO_AUTH_TOKEN"),
};
