import "dotenv/config";
import { z } from "zod";

/**
 * Environment variable schema — validates at startup.
 * If any required variable is missing or malformed, the process exits immediately.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  PORT: z.coerce.number().int().positive().default(3001),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  APP_URL: z.string().url().default("http://localhost:3001"),
  GEMINI_API_KEY: z.string().default("placeholder_replace_me"),
  JWT_SECRET: z.string().default("placeholder_replace_me"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export type Env = z.infer<typeof envSchema>;
