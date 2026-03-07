import process from "node:process";
import { z } from "zod";

process.loadEnvFile?.();

const envSchema = z.object({
  DATABASE_URL: z.url(),
  APP_TIMEZONE: z.string().default("Europe/Berlin"),
  APP_URL: z.url().default("http://localhost:3000"),
});

export type AppConfig = {
  databaseUrl: string;
  appTimezone: string;
  appUrl: string;
};

export function getAppConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.parse({
    DATABASE_URL: env.DATABASE_URL,
    APP_TIMEZONE: env.APP_TIMEZONE,
    APP_URL: env.APP_URL,
  });

  return {
    databaseUrl: parsed.DATABASE_URL,
    appTimezone: parsed.APP_TIMEZONE,
    appUrl: parsed.APP_URL,
  };
}
