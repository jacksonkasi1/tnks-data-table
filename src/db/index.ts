import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// ** Table Schema
import * as schema from "./schema";

// ** Env
import { env } from "@/env";

export function createDb() {
  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql, {
    schema,
  });
  return db;
}

export type DbInstance = ReturnType<typeof createDb>;
