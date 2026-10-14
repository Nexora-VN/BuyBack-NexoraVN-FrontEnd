import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

// Run against the exact production build, with the same indexing mode as CI.
const mode = process.env.SEO_INDEXABLE ?? "false";
if (!["true", "false"].includes(mode)) throw new Error("SEO_INDEXABLE must be true or false");
const port = process.env.SEO_AUDIT_PORT || "3100";
const base = `http://127.0.0.1:${port}`;
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--port", port],
  {
    stdio: "inherit",
    env: { ...process.env, SEO_INDEXABLE: mode },
  },
);
let stopped = false;
server.on("exit", () => {
  stopped = true;
});
const stop = () => {
  if (!stopped) server.kill("SIGTERM");
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
try {
  let ready = false;
  for (let attempt = 0; attempt < 60 && !stopped; attempt++) {
    try {
      const response = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(1000) });
      await response.body?.cancel();
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      /* Wait for the local production server. */
    }
    await delay(500);
  }
  if (!ready) throw new Error("Production server did not become healthy");
  const args = ["scripts/audit-public-seo.mjs", base, ...(mode === "true" ? ["--indexable"] : [])];
  const audit = spawn(process.execPath, args, { stdio: "inherit" });
  process.exitCode = await new Promise((resolve, reject) => {
    audit.on("error", reject);
    audit.on("exit", (code) => resolve(code ?? 1));
  });
} finally {
  stop();
}
