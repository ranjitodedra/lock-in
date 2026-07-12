/**
 * Configure Google OAuth on the linked Supabase project.
 *
 * Usage:
 *   npm run setup:google-oauth
 *   node scripts/setup-google-oauth.mjs <client-id> <client-secret>
 *
 * Or set in .env.local:
 *   SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID
 *   SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import keytar from "keytar";
import { getSupabaseProjectRef, loadEnvLocal } from "./load-env-local.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const env = { ...process.env, ...loadEnvLocal() };
const projectRef = getSupabaseProjectRef(env);
const callbackUrl = `https://${projectRef}.supabase.co/auth/v1/callback`;
const jsOrigin = env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

function openGoogleCloudConsole(clientId) {
  if (process.platform !== "win32") {
    console.log(`Open OAuth client and add redirect URI: ${callbackUrl}`);
    return;
  }
  const editUrl = `https://console.cloud.google.com/apis/credentials/oauthclient/${clientId}`;
  const ps = [
    `Set-Clipboard -Value '${callbackUrl}'`,
    `Start-Process '${editUrl}'`,
  ].join("; ");
  execSync(`powershell -NoProfile -Command "${ps}"`, { stdio: "inherit" });
  console.log("\nOpened Google OAuth client (redirect URI copied to clipboard).");
  console.log(`Add JS origin: ${jsOrigin}`);
  console.log(`Add redirect URI: ${callbackUrl}`);
  console.log("Then click Save.\n");
}

function verifyGoogleOAuth() {
  execSync("node scripts/verify-google-oauth.mjs", { cwd: root, stdio: "inherit" });
}

async function getAccessToken() {
  const creds = await keytar.findCredentials("Supabase CLI");
  const match = creds.find((c) => c.account === "supabase" && c.password);
  if (!match?.password) {
    throw new Error("Supabase CLI not logged in. Run: supabase login");
  }
  return match.password;
}

async function patchAuthConfig(token, clientId, clientSecret) {
  const body = {
    site_url: "http://localhost:3000",
    uri_allow_list:
      "http://localhost:3000/auth/callback\nhttp://localhost:3000/**",
    external_google_enabled: true,
    external_google_client_id: clientId,
    external_google_secret: clientSecret,
    mailer_autoconfirm: false,
  };

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/config/auth`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Auth config PATCH failed (${res.status}): ${text}`);
  }
}

function printGoogleConsoleSteps() {
  console.log("\n--- Google Cloud Console setup (one-time) ---\n");
  console.log("1. Open: https://console.cloud.google.com/apis/credentials");
  console.log("2. Create OAuth client ID → Web application");
  console.log("3. Authorized JavaScript origins: http://localhost:3000");
  console.log(`4. Authorized redirect URIs (required): ${callbackUrl}`);
  console.log(
    "5. Run: npm run setup:google-oauth -- <client-id> <client-secret>",
  );
  console.log("   Or add credentials to .env.local and run npm run setup:google-oauth\n");
}

const clientId =
  process.argv[2]?.trim() || env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID?.trim();
const clientSecret =
  process.argv[3]?.trim() ||
  env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET?.trim();

if (!clientId || !clientSecret) {
  printGoogleConsoleSteps();
  console.error("Missing Google OAuth client ID or secret.");
  process.exit(1);
}

try {
  const token = await getAccessToken();
  await patchAuthConfig(token, clientId, clientSecret);

  // Sync config.toml for future pushes (env substitution)
  const envLocalPath = resolve(root, ".env.local");
  if (existsSync(envLocalPath)) {
    let content = readFileSync(envLocalPath, "utf8");
    const setLine = (key, value) => {
      const re = new RegExp(`^${key}=.*$`, "m");
      const line = `${key}=${value}`;
      content = re.test(content)
        ? content.replace(re, line)
        : `${content.trimEnd()}\n${line}\n`;
    };
    setLine("SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID", clientId);
    setLine("SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET", clientSecret);
    writeFileSync(envLocalPath, content);
  }

  execSync("supabase config push --yes", {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID: clientId,
      SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET: clientSecret,
    },
  });

  console.log("\nGoogle OAuth configured on Supabase project:", projectRef);
  openGoogleCloudConsole(clientId);
  try {
    verifyGoogleOAuth();
    console.log("Google redirect URI verified.");
  } catch {
    console.log(
      "Google redirect URI not verified yet. Save in Google Cloud Console, then run: npm run verify:google-oauth",
    );
  }
  console.log("Test: http://localhost:3000/login → Continue with Google\n");
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
