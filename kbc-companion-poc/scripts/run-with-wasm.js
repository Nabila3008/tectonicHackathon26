/**
 * Windows environments that block native .node binaries (Application Control)
 * can fall back to Next's WASM SWC via NEXT_TEST_WASM_DIR.
 */
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const cmd = process.argv[2] || "dev";
const wasmDir = path.join(
  __dirname,
  "..",
  "node_modules",
  "@next",
  "swc-wasm-nodejs"
);

if (fs.existsSync(path.join(wasmDir, "wasm.js"))) {
  process.env.NEXT_TEST_WASM_DIR = wasmDir;
}

const child = spawn("npx", ["next", cmd], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));
