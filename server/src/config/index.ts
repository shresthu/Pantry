import "dotenv/config";
import { z } from "zod";

const optional = z.string().min(1).optional();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.string().default("info"),
  DATABASE_URL: optional,
  DIRECT_URL: optional,
  SUPABASE_URL: optional,
  SUPABASE_ANON_KEY: optional,
  REDIS_URL: optional,
});

export type Config = z.infer<typeof envSchema>;

export const config: Config = envSchema.parse(process.env);
