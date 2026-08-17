import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const listenerSource = fs.readFileSync(path.join(projectRoot, "src", "listen", "listen.js"), "utf8");
const patchSource = fs.readFileSync(path.join(projectRoot, "scripts", "patch-kaguya-cookiejar.mjs"), "utf8");

assert.match(
  listenerSource,
  /process\.env\.SHADOW_ENRICH_THREAD_METADATA === "YES"/,
  "Group metadata enrichment must remain opt-in so a legacy GraphQL failure cannot block commands."
);

assert.match(
  patchSource,
  /Number\(err\?\.error\) === 1357004/,
  "The Kaguya patch must recognize Facebook error 1357004."
);

assert.match(
  patchSource,
  /api\.getThreadInfoDeprecated\(threadID, callback\)/,
  "The Kaguya patch must use Kaguya's built-in non-GraphQL fallback."
);

console.log("GraphQL recovery safeguards verified.");
