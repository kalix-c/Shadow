import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const listenerSource = fs.readFileSync(path.join(projectRoot, "src", "listen", "listen.js"), "utf8");
const responseEngineSource = fs.readFileSync(path.join(projectRoot, "src", "shadow", "ShadowResponseEngine.js"), "utf8");
const bootstrapExtractorSource = fs.readFileSync(path.join(projectRoot, "src", "shadow", "extractMqttBootstrap.js"), "utf8");
const patchSource = fs.readFileSync(path.join(projectRoot, "scripts", "patch-kaguya-cookiejar.mjs"), "utf8");

assert.doesNotMatch(
  listenerSource,
  /new\s+CommandHandler/,
  "The retired CommandHandler must not remain on the active listener path."
);

assert.doesNotMatch(
  responseEngineSource,
  /getThreadInfo|Thread\.create/,
  "The response engine must not issue legacy thread-metadata requests before responding to a command."
);

assert.doesNotMatch(
  bootstrapExtractorSource,
  /graphql|api\/graphqlbatch|https?:\/\//i,
  "Bootstrap extraction must remain pure and must not introduce an unverified GraphQL network fallback."
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
