import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// ** Table Schema
import * as schema from "./schema";

// ** Env
import { env } from "@/env";

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, {
  schema,
});
