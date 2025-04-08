// ** Third Party Lib
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, { message: "DATABASE_URL is required" }),
});

export const env = envSchema.parse(process.env);
