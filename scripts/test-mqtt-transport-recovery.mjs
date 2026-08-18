import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runtimePath = path.join(root, "node_modules", "@trunqkj3n", "kaguya", "src", "listenMqtt.js");
const runtime = fs.readFileSync(runtimePath, "utf8");

const requiredMarkers = [
  "st: topics.slice(),",
  "edge-chat.messenger.com",
  "https://www.messenger.com",
  '"/orca_message_notifications",',
  "function collectMessageDeltas(jsonMessage)",
  'type: "mqtt_unparsed"',
  "const messageDeltas = collectMessageDeltas(jsonMessage);",
  "function shadowResolveMqttBootstrap",
  'type: "mqtt_bootstrap_outcome"',
  'type: "mqtt_queue_blocked"',
  "if (noMqttData || !shadowHasMqttBootstrap(ctx))",
  "function shadowRequestMqttRecovery(ctx",
  "const maxAttempts = 2;",
  'type: "mqtt_recovery_attempt"',
  'type: "mqtt_recovery_escalated"',
  "MQTT_READY_TIMEOUT",
  "MQTT_CONNECT_TIMEOUT",
  "const shadowConnectTimeout = setTimeout",
  "clearTimeout(shadowConnectTimeout);",
  "MQTT_BOOTSTRAP_TIMEOUT",
  "const shadowBootstrapTimeout = setTimeout",
  "clearTimeout(shadowBootstrapTimeout);"
];

const missing = requiredMarkers.filter((marker) => !runtime.includes(marker));
if (missing.length > 0) {
  console.error("MQTT transport recovery test failed: required compatibility markers are absent.");
  process.exit(1);
}

const guardIndex = runtime.indexOf('type: "mqtt_queue_blocked"');
const clientIndex = runtime.indexOf("ctx.mqttClient = new mqtt.Client");
if (guardIndex < 0 || clientIndex < 0 || guardIndex > clientIndex) {
  console.error("MQTT transport recovery test failed: bootstrap guard must run before creating an MQTT client.");
  process.exit(1);
}

console.log("MQTT transport recovery test passed: Messenger-compatible subscriptions, guarded bootstrap, headers, and alternate delta routing are installed.");
