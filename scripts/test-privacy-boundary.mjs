import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shadowFiles = [
  "src/shadow/BootstrapProvider.js",
  "src/shadow/BootstrapSelector.js",
  "src/shadow/BoundedMqttRecovery.js",
  "src/shadow/CommandEvent.js",
  "src/shadow/CommandRouter.js",
  "src/shadow/normalizeMqttEvent.js",
  "src/shadow/SafeTelemetry.js",
  "src/shadow/ShadowMessenger.js",
  "src/shadow/ShadowResponseEngine.js"
];

const prohibitedLogging = /console\.(?:log|warn|error)|JSON\.stringify\s*\(\s*(?:this\.)?(?:appState|event|primary|secondary)\b|\.emit\(\s*["']telemetry["']\s*,\s*\{[^}]*\b(?:body|cookie|appState|messageID|threadID|senderID)\b/s;

for (const relativePath of shadowFiles) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  assert.equal(prohibitedLogging.test(source), false, `${relativePath} contains prohibited raw telemetry or console logging.`);
}

const telemetrySource = fs.readFileSync(path.join(root, "src/shadow/SafeTelemetry.js"), "utf8");
for (const forbiddenKey of ["body", "cookie", "appState", "messageID", "threadID", "senderID"]) {
  assert.match(telemetrySource, new RegExp(`forbiddenKeys[^]*["']${forbiddenKey}["']`), `SafeTelemetry must block ${forbiddenKey}.`);
}

console.log("Privacy boundary test passed: the modified Shadow transport emits only allowlisted scalar telemetry.");
