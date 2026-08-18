import assert from "node:assert/strict";
import { ShadowMessenger } from "../src/shadow/ShadowMessenger.js";
import { normalizeMqttCallback } from "../src/shadow/normalizeMqttEvent.js";

assert.deepEqual(
  normalizeMqttCallback(null, { type: "mqtt_topic", topic: "/t_ms" }),
  { kind: "diagnostic", type: "mqtt_topic", topic: "/t_ms" }
);

assert.deepEqual(
  normalizeMqttCallback(null, { type: "mqtt_unparsed", topic: "/inbox", shape: ["payload"] }),
  { kind: "diagnostic", type: "mqtt_unparsed", topic: "/inbox", shape: ["payload"] }
);

assert.deepEqual(
  normalizeMqttCallback(null, { type: "mqtt_bootstrap_outcome", status: "unavailable", source: "messenger_html", reason: "missing_sequence" }),
  { kind: "diagnostic", type: "mqtt_bootstrap_outcome", status: "unavailable", source: "messenger_html", reason: "missing_sequence" }
);

assert.equal(normalizeMqttCallback({ type: "mqtt_queue_blocked" }, null).kind, "transport_error");
assert.equal(normalizeMqttCallback({ type: "mqtt_connect_timeout", code: "MQTT_CONNECT_TIMEOUT" }, null).kind, "transport_error");
assert.equal(normalizeMqttCallback(null, { type: "typ", isGroup: true }).kind, "event");

const received = [];
const lifecycle = [];
const telemetryRecords = [];
const api = {
  setOptions() {},
  listenMqtt(callback) {
    callback(null, { type: "typ", isGroup: true });
    callback(null, { type: "message", messageID: "fixture-1", isGroup: true, body: ".مساعدة" });
    callback(null, { type: "message", messageID: "fixture-1", isGroup: true, body: ".مساعدة" });
    callback(null, { type: "message", messageID: "fixture-2", isGroup: true, body: ".اوامر" });
  }
};
const messenger = new ShadowMessenger({
  login: (_state, _options, callback) => callback(null, api),
  appState: [],
  options: {}
});
messenger.on("apiReady", (availableApi) => {
  assert.equal(availableApi, api);
  lifecycle.push("apiReady");
});
messenger.on("event", (event) => {
  received.push(event.type);
  lifecycle.push("event");
});
messenger.on("telemetry", (record) => telemetryRecords.push(record));
await messenger.connect();
assert.deepEqual(received, ["typ", "message", "message"]);
assert.deepEqual(lifecycle, ["apiReady", "event", "event", "event"]);
assert.deepEqual(telemetryRecords, [
  { signal: "EVENT_CLASSIFIED", event_type: "typ", classification: "ignored" },
  { signal: "EVENT_CLASSIFIED", event_type: "message", classification: "routed" },
  { signal: "EVENT_CLASSIFIED", event_type: "message", classification: "routed" },
  { signal: "EVENT_CLASSIFIED", event_type: "message", classification: "routed" }
]);
assert.equal(messenger.api, api);

console.log("Shadow Messenger unit test passed: API readiness precedes typing and distinct message callbacks while duplicate messages are suppressed without logging content.");
