import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";
const isVercelProduction = isProduction && process.env.VERCEL === "1";

const appSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  APP_URL: z.string().url().default("http://localhost:3000"),
  SENTRY_DSN: z.string().url().optional(),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: isVercelProduction
    ? z.string().min(1)
    : z.string().min(1).optional(),
  CRON_SECRET: isVercelProduction
    ? z.string().min(1)
    : z.string().min(1).optional(),
  CODEX_CLIENT_ID: z.string().default("app_EMoamEEZ73f0CkXaXp7hrann"),
  CODEX_MODEL: z.string().default("gpt-5.5"),
  ADMIN_EMAIL: z.string().email().optional(),
});

function parseEnv<T extends z.ZodTypeAny>(schema: T, source: Record<string, string | undefined>) {
  const result = schema.safeParse(source);
  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${formatted}`);
  }
  return result.data as z.infer<T>;
}

export function loadEnv(source: Record<string, string | undefined> = process.env) {
  const appEnv = parseEnv(appSchema, {
    SUPABASE_URL: source.SUPABASE_URL,
    SUPABASE_ANON_KEY: source.SUPABASE_ANON_KEY,
    APP_URL: source.APP_URL,
    SENTRY_DSN: source.SENTRY_DSN,
  });

  const serverEnv = parseEnv(serverSchema, {
    SUPABASE_SERVICE_ROLE_KEY: source.SUPABASE_SERVICE_ROLE_KEY,
    CRON_SECRET: source.CRON_SECRET,
    CODEX_CLIENT_ID: source.CODEX_CLIENT_ID,
    CODEX_MODEL: source.CODEX_MODEL,
    ADMIN_EMAIL: source.ADMIN_EMAIL,
  });

  return {
    ...appEnv,
    ...serverEnv,
  };
}

export const env = loadEnv();
