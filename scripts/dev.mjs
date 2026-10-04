import { spawn, spawnSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const windows = process.platform === "win32";
const commandName = (name) => windows && (name === "npm" || name === "npx") ? `${name}.cmd` : name;
const supabaseArgs = ["--yes", "supabase@2.113.0"];
let functionsProcess;
let frontendProcess;
let stopping = false;

function launch(command, args, options = {}) {
  return spawn(commandName(command), args, {
    cwd: root,
    shell: windows,
    stdio: options.capture ? ["ignore", "pipe", "inherit"] : "inherit",
    env: options.env ?? process.env,
  });
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = launch(command, args, options);
    let output = "";
    if (options.capture) child.stdout.on("data", (chunk) => { output += chunk; });
    child.once("error", reject);
    child.once("close", (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(`${command} ${args.slice(-2).join(" ")} failed (exit ${code}).`));
    });
  });
}

function stopChild(child) {
  if (!child || child.exitCode !== null || !child.pid) return;
  if (windows) {
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    child.kill("SIGTERM");
  }
}

function stop() {
  if (stopping) return;
  stopping = true;
  stopChild(frontendProcess);
  stopChild(functionsProcess);
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

async function functionIsReady(apiUrl) {
  try {
    const response = await fetch(`${apiUrl}/functions/v1/manage-students`, {
      signal: AbortSignal.timeout(3000),
    });
    const body = await response.text();
    return response.status === 401 && body.includes("MISSING_CREDENTIALS");
  } catch {
    return false;
  }
}

async function waitForFunctions(apiUrl) {
  for (let attempt = 0; attempt < 90; attempt++) {
    if (await functionIsReady(apiUrl)) return;
    if (functionsProcess && functionsProcess.exitCode !== null) {
      throw new Error("Edge Functions stopped before they were ready.");
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error("Edge Functions did not start. Check Docker and the output above.");
}

async function ensureLocalAdmin(status) {
  const { hostname } = new URL(status.API_URL);
  if (hostname !== "127.0.0.1" && hostname !== "localhost") {
    throw new Error("Automatic admin setup is only allowed for local Supabase.");
  }

  const requireFrontend = createRequire(path.join(root, "frontend", "package.json"));
  const { createClient } = requireFrontend("@supabase/supabase-js");
  const admin = createClient(status.API_URL, status.SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { count, error } = await admin.from("profiles")
    .select("user_id", { count: "exact", head: true })
    .eq("account_type", "admin")
    .eq("active", true);
  if (error) throw new Error(`Could not check local admins: ${error.message}`);
  if (count > 0) return;

  const email = `local-admin-${randomUUID().slice(0, 8)}@example.com`;
  const password = `${randomBytes(18).toString("base64url")}Aa1!`;
  const { data, error: createError } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (createError || !data.user) {
    throw new Error(`Could not create a local admin: ${createError?.message ?? "Unknown error"}`);
  }

  const { data: profile, error: profileError } = await admin.from("profiles").update({
    first_name: "Local", last_name: "Admin", account_type: "admin", active: true,
  }).eq("user_id", data.user.id).select("user_id").maybeSingle();
  if (profileError || !profile) {
    await admin.auth.admin.deleteUser(data.user.id);
    throw new Error(`Could not assign the local admin role: ${profileError?.message ?? "Profile not found"}`);
  }

  console.log("\nLocal admin created for this computer:");
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${password}`);
  console.log("This password is shown only now. Do not use this account for real patient data.\n");
}

async function main() {
  console.log("Checking Docker...");
  try {
    await run("docker", ["info", "--format", "{{.ServerVersion}}"], { capture: true });
  } catch {
    throw new Error("Docker Desktop is not running or Docker is not installed. Start Docker and try npm run dev again.");
  }

  console.log("Starting local Supabase (first run may download Docker images)...");
  await run("npx", [...supabaseArgs, "start"], { capture: true });

  console.log("Applying pending local migrations...");
  await run("npx", [...supabaseArgs, "migration", "up", "--local", "--include-all"]);

  const output = await run("npx", [...supabaseArgs, "status", "-o", "json"], { capture: true });
  const status = JSON.parse(output);
  if (!status.API_URL || !(status.PUBLISHABLE_KEY || status.ANON_KEY) || !status.SERVICE_ROLE_KEY) {
    throw new Error("Supabase status did not include the local URL and keys.");
  }

  if (!existsSync(path.join(root, "frontend", "node_modules", "@supabase", "supabase-js"))) {
    console.log("Installing frontend dependencies...");
    await run("npm", ["--prefix", "frontend", "ci"]);
  }

  await ensureLocalAdmin(status);

  if (!(await functionIsReady(status.API_URL))) {
    console.log("Serving Edge Functions...");
    functionsProcess = launch("npx", [...supabaseArgs, "functions", "serve"]);
    functionsProcess.once("error", (error) => console.error("Edge Functions failed:", error.message));
    await waitForFunctions(status.API_URL);
  }

  console.log("Starting the app. Press Ctrl+C to stop the app and Edge Functions.\n");
  const env = {
    ...process.env,
    VITE_SUPABASE_URL: status.API_URL,
    VITE_SUPABASE_ANON_KEY: status.PUBLISHABLE_KEY || status.ANON_KEY,
  };
  frontendProcess = launch("npm", ["--prefix", "frontend", "run", "dev"], { env });
  const code = await new Promise((resolve, reject) => {
    frontendProcess.once("error", reject);
    frontendProcess.once("close", resolve);
  });
  if (!stopping && code !== 0) throw new Error(`Frontend stopped (exit ${code}).`);
}

try {
  await main();
} catch (error) {
  if (!stopping) {
    console.error(error.message);
    process.exitCode = 1;
  }
} finally {
  stop();
}
