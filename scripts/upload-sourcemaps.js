#!/usr/bin/env node
import { spawn } from "node:child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.join(
  __dirname,
  "../node_modules/@prifina-dev/next-telemetry/upload-sourcemaps.js"
);

const child = spawn("node", [scriptPath], {
  stdio: "inherit",
  env: { ...process.env },
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
