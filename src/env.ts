import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";
const isVercelProduction = isProduction && process.env.VERCEL === "1";

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
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

const clientEnv = parseEnv(clientSchema, {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
});

const serverEnv = parseEnv(serverSchema, {
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  CRON_SECRET: process.env.CRON_SECRET,
  CODEX_CLIENT_ID: process.env.CODEX_CLIENT_ID,
  CODEX_MODEL: process.env.CODEX_MODEL,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
});

export const env = {
  ...clientEnv,
  ...serverEnv,
};
