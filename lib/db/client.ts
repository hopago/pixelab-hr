import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __pgClient: ReturnType<typeof postgres> | undefined;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and fill it.",
  );
}

const client =
  globalThis.__pgClient ??
  postgres(connectionString, { prepare: false, max: 5 });
if (process.env.NODE_ENV !== "production") globalThis.__pgClient = client;

export const db = drizzle(client, { schema });
export { schema };
